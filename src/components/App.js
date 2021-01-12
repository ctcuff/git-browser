import '../style/app.scss'
import React from 'react'
import Editor from './Editor'
import { setCSSVar, getLanguageFromFileName } from '../scripts/util'
import PropTypes from 'prop-types'
import ExplorerPanel from './ExplorerPanel'
import GitHubAPI from '../scripts/github-api'
import { Tab, TabView } from './Tabs'
import debounce from 'lodash/debounce'
import LoadingOverlay from './LoadingOverlay'
import ErrorOverlay from './ErrorOverlay'
import FileRenderer from './FileRenderer'
import gitBrowserIconDark from '../assets/img/git-browser-icon-dark.svg'
import gitBrowserIconLight from '../assets/img/git-browser-icon-light.svg'
import Logger from '../scripts/logger'
import { connect } from 'react-redux'

// Don't allow API requests to files that meet/exceed this size
// (in bytes) to avoid network strain and long render times
const MAX_FILE_SIZE = 20_000_000 // 20 MB

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      // Used to make sure the same tab can't be
      // opened multiple times
      openedFilePaths: new Set(),
      openedTabs: [],
      activeTabIndex: 0,
      isLoading: false
    }

    this.onSelectFile = this.onSelectFile.bind(this)
    this.onTabClosed = this.onTabClosed.bind(this)
    this.closeAllTabs = this.closeAllTabs.bind(this)
    this.renderTabContent = this.renderTabContent.bind(this)
    this.findTabIndex = this.findTabIndex.bind(this)
    this.setActiveTabIndex = this.setActiveTabIndex.bind(this)
    this.updateViewport = debounce(this.updateViewport.bind(this), 250)
    this.loadFile = this.loadFile.bind(this)
    this.toggleLoadingOverlay = this.toggleLoadingOverlay.bind(this)
    this.onToggleRenderable = this.onToggleRenderable.bind(this)
    this.onSearchFinished = this.onSearchFinished.bind(this)
    this.decodeTabContent = this.decodeTabContent.bind(this)
  }

  componentDidMount() {
    this.updateViewport()
    window.addEventListener('resize', this.updateViewport)

    // Lazy load monaco so the Editor component can render quicker
    import('monaco-editor/esm/vs/editor/editor.api.js').catch(err => {
      Logger.error(err)
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewport)
  }

  updateViewport() {
    // Updates the --vh variable used in the height mixin
    setCSSVar('--vh', window.innerHeight * 0.01 + 'px')
  }

  onSelectFile(node) {
    const { openedFilePaths, openedTabs } = this.state

    // Don't open this file in a new tab since it's already open
    if (openedFilePaths.has(node.path)) {
      this.setActiveTabIndex(this.findTabIndex(node.path))
      return
    }

    const initialTabState = {
      isLoading: true,
      index: openedTabs.length,
      title: node.name,
      path: node.path,
      isTooLarge: false,
      canEditorRender: false,
      hasError: false,
      content: ''
    }

    // Render a temporary loading tab while we wait for the
    // GitHub API request to finish
    this.setState(
      {
        openedFilePaths: new Set(openedFilePaths.add(node.path)),
        activeTabIndex: openedTabs.length,
        openedTabs: [...openedTabs, initialTabState]
      },
      () => this.loadFile(node)
    )
  }

  loadFile(file) {
    const { extension } = getLanguageFromFileName(file.name)
    const openedTabs = this.state.openedTabs
    let tabIndex = this.findTabIndex(file.path)

    if (file.size >= MAX_FILE_SIZE) {
      openedTabs[tabIndex].isLoading = false
      openedTabs[tabIndex].isTooLarge = true
      this.setState({ openedTabs })
      return
    }

    GitHubAPI.getFile(file.url)
      .then(content => {
        // Need to find this tab again to make sure it wasn't closed.
        // The index will be -1 if the tab was closed
        // before the request finished loading
        tabIndex = this.findTabIndex(file.path)

        if (tabIndex === -1) {
          return
        }

        // Skip decoding this file if it can't be displayed by the editor
        // or if it should be displayed bt the FileRenderer first
        if (
          Editor.previewExtensions.has(extension) ||
          Editor.illegalExtensions.has(extension)
        ) {
          openedTabs[tabIndex].content = content
          openedTabs[tabIndex].canEditorRender = false
          openedTabs[tabIndex].isLoading = false

          this.setState({ openedTabs: this.state.openedTabs })
          return
        }

        // Try to decode the file to see if it can be rendered by the
        // editor. If it can't, pass it to the FileRenderer
        this.decodeTabContent(content, tabIndex)
      })
      .catch(err => {
        tabIndex = this.findTabIndex(file.path)

        if (tabIndex === -1) {
          return
        }

        openedTabs[tabIndex].hasError = true
        openedTabs[tabIndex].isLoading = false

        this.setState({ openedTabs: this.state.openedTabs })

        Logger.error(err)
      })
  }

  decodeTabContent(content, tabIndex) {
    const openedTabs = this.state.openedTabs
    // Use a worker to avoid UI freezes
    const decodeWorker = new Worker('../scripts/encode-decode-worker.js', {
      type: 'module'
    })

    decodeWorker.postMessage({
      message: content,
      type: 'decode'
    })

    decodeWorker.onerror = event => {
      openedTabs[tabIndex].hasError = true
      openedTabs[tabIndex].isLoading = false

      this.setState({ openedTabs: this.state.openedTabs })

      Logger.error(event.message)
      decodeWorker.terminate()
    }

    decodeWorker.onmessage = event => {
      openedTabs[tabIndex].content = event.data || content
      openedTabs[tabIndex].canEditorRender = event.data !== null
      openedTabs[tabIndex].isLoading = false

      this.setState({ openedTabs: this.state.openedTabs })

      decodeWorker.terminate()
    }
  }

  findTabIndex(path) {
    const openedTabs = this.state.openedTabs

    for (let i = 0; i < openedTabs.length; i++) {
      if (openedTabs[i].path === path) {
        return i
      }
    }

    return -1
  }

  renderTabContent(tab, index) {
    const {
      title,
      content,
      isLoading,
      isTooLarge,
      canEditorRender,
      hasError
    } = tab

    if (index !== this.state.activeTabIndex) {
      return null
    }

    if (isLoading) {
      return <LoadingOverlay text={`Loading ${title}...`} />
    }

    if (isTooLarge) {
      return (
        <ErrorOverlay message="Sorry, but this file is too large to display." />
      )
    }

    if (hasError) {
      return <ErrorOverlay message={"Couldn't load file."} />
    }

    const { extension, language } = getLanguageFromFileName(title)

    return canEditorRender ? (
      <Editor
        fileName={title}
        extension={extension}
        content={content}
        language={language}
        onForceRender={this.onToggleRenderable}
      />
    ) : (
      <FileRenderer
        content={content}
        title={title}
        extension={extension}
        onForceRender={this.onToggleRenderable}
      />
    )
  }

  onToggleRenderable(content, canEditorRender) {
    // Marks a tab as either renderable by the file preview
    // component, or by the Editor component
    const { activeTabIndex, openedTabs } = this.state

    openedTabs[activeTabIndex].canEditorRender = canEditorRender
    openedTabs[activeTabIndex].content = content

    this.setState({ openedTabs })
  }

  onTabClosed(tabIndex) {
    let activeTabIndex = this.state.activeTabIndex
    const openedTabs = this.state.openedTabs.filter((tab, index) => {
      return tabIndex !== index
    })
    const openedFilePaths = new Set(openedTabs.map(node => node.path))

    // If the active tab was closed but there are still tabs left,
    // set the tab to the left of the closed tab as the active tab,
    // but only as long as there are still tabs to the left.
    if (tabIndex === activeTabIndex) {
      activeTabIndex = Math.max(activeTabIndex - 1, 0)
    }

    // Make sure the currently active tab doesn't change when tabs
    // to the left of it are closed
    if (tabIndex < activeTabIndex) {
      activeTabIndex -= 1
    }

    this.setState({
      openedFilePaths,
      openedTabs,
      activeTabIndex
    })
  }

  closeAllTabs() {
    this.setState({
      openedFilePaths: new Set(),
      openedTabs: []
    })
  }

  onSearchFinished(hasError) {
    this.setState({ isLoading: false })

    if (!hasError) {
      this.closeAllTabs()
    }
  }

  toggleLoadingOverlay() {
    this.setState({ isLoading: !this.state.isLoading })
  }

  setActiveTabIndex(activeTabIndex) {
    if (this.state.activeTabIndex !== activeTabIndex) {
      this.setState({ activeTabIndex })
    }
  }

  render() {
    const { activeTabIndex, openedTabs, isLoading } = this.state
    const icon =
      this.props.theme === 'theme-light'
        ? gitBrowserIconLight
        : gitBrowserIconDark

    return (
      <div className="app">
        <ExplorerPanel
          onSelectFile={this.onSelectFile}
          onSearchFinished={this.onSearchFinished}
          onSearchStarted={this.toggleLoadingOverlay}
        />
        <div className="right">
          {isLoading && (
            <LoadingOverlay
              text="Loading repository..."
              className="app-loading-overlay"
            />
          )}
          {openedTabs.length === 0 && (
            <div className="landing">
              <div className="logo">
                <img src={icon} alt="Git Browser icon" />
              </div>
              <h2 className="heading">Welcome to Git Browser</h2>
              <div className="description">
                <p>To get started, enter a GitHub URL in the search bar.</p>
                <p>
                  If you haven&apos;t already, sign in to get access to a higher{' '}
                  <a
                    href="https://docs.github.com/en/free-pro-team@latest/rest/reference/rate-limit"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    rate limit.
                  </a>
                </p>
              </div>
            </div>
          )}
          <TabView
            onTabClosed={this.onTabClosed}
            activeTabIndex={activeTabIndex}
            onSelectTab={this.setActiveTabIndex}
            onCloseAllClick={this.closeAllTabs}
          >
            {openedTabs.map((tab, index) => (
              <Tab title={tab.title} key={tab.path} hint={tab.path}>
                {this.renderTabContent(tab, index)}
              </Tab>
            ))}
          </TabView>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  theme: PropTypes.oneOf(['theme-dark', 'theme-light'])
}

App.defaultProps = {
  theme: 'theme-light'
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(App)
