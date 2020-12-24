import '../style/app.scss'
import React from 'react'
import Editor from './Editor'
import {
  parseCSSVar,
  setCSSVar,
  getLanguageFromFileName
} from '../scripts/util'
import PropTypes from 'prop-types'
import ExplorerPanel from './ExplorerPanel'
import GitHubAPI from '../scripts/github-api'
import Gutter from './Gutter'
import { Tab, TabView } from './Tabs'
import { AiOutlineLeft, AiOutlineMenu } from 'react-icons/ai'
import { BsThreeDotsVertical } from 'react-icons/bs'
import debounce from 'lodash/debounce'
import LoadingOverlay from './LoadingOverlay'
import FileRenderer from './FileRenderer'

const clamp = (min, value, max) => Math.max(min, Math.min(value, max))

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      // Used to make sure the same tab can't be
      // opened multiple times
      openedFilePaths: new Set(),
      openedTabs: [],
      activeTabIndex: 0,
      isExplorerOpen: false,
      isLoading: false
    }

    this.mousePosition = 0

    this.onSelectFile = this.onSelectFile.bind(this)
    this.onPanelMouseDown = this.onPanelMouseDown.bind(this)
    this.resizePanel = this.resizePanel.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onTabClosed = this.onTabClosed.bind(this)
    this.onSearchFinished = this.onSearchFinished.bind(this)
    this.renderTab = this.renderTab.bind(this)
    this.resize = this.resize.bind(this)
    this.findTabIndex = this.findTabIndex.bind(this)
    this.setActiveTabIndex = this.setActiveTabIndex.bind(this)
    this.toggleExplorer = this.toggleExplorer.bind(this)
    this.updateViewport = debounce(this.updateViewport.bind(this), 250)
    this.loadFile = this.loadFile.bind(this)
    this.toggleLoadingOverlay = this.toggleLoadingOverlay.bind(this)
  }

  componentDidMount() {
    this.updateViewport()
    document.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('resize', this.updateViewport)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('resize', this.updateViewport)
  }

  updateViewport() {
    // Updates the --vh variable used in the height mixin
    const vh = window.innerHeight * 0.01
    setCSSVar('--vh', vh + 'px')
  }

  onSelectFile(node) {
    const { openedFilePaths, openedTabs } = this.state

    if (node.type === 'folder') {
      return
    }

    // Don't open this file in a new tab since it's already open
    if (openedFilePaths.has(node.path)) {
      this.setActiveTabIndex(this.findTabIndex(node.path))
      return
    }

    // Render a temporary loading tab while we wait for the
    // GitHub API request to finish
    this.setState(
      {
        openedFilePaths: new Set(openedFilePaths.add(node.path)),
        activeTabIndex: openedTabs.length,
        openedTabs: [
          ...openedTabs,
          {
            isLoading: true,
            index: openedTabs.length,
            title: node.name,
            path: node.path
          }
        ]
      },
      () => this.loadFile(node)
    )
  }

  loadFile(node) {
    GitHubAPI.getFile(node.url).then(content => {
      const tabs = this.state.openedTabs
      const tabIndex = this.findTabIndex(node.path)

      // The index will be -1 if the tab was closed
      // before the request finished loading
      if (tabIndex >= 0) {
        // Replace the loading tab with the loaded file content
        tabs[tabIndex].content = content
        tabs[tabIndex].isLoading = false

        this.setState({
          activeTabIndex: this.state.activeTabIndex,
          openedTabs: tabs
        })
      }
    })
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

  resize(event) {
    // The smallest the panel is allowed to be before it snaps to 0px
    const absoluteMin = 80
    const absoluteMax = document.body.clientWidth - 100
    const diff = this.mousePosition - event.x
    const panelSize = parseCSSVar('--file-explorer-width')

    // Ensures that the panel can only shrink to the size of
    // the body - 60px and grow only to the size of the page - 32px
    let newSize = clamp(absoluteMin, panelSize - diff, absoluteMax)

    // Setting the mouse position to the new size of the panel
    // emulates vscode's way of shrinking the file explorer. This
    // ensures that the size of panel doesn't go past the position of the mouse
    this.mousePosition = newSize

    // Snaps the panel closed when the cursor position
    // reaches two thirds the panel's absolute minimum size
    if (event.x < (2 * absoluteMin) / 3) {
      newSize = 0
    }

    setCSSVar('--file-explorer-width', newSize + 'px')
  }

  resizePanel(event) {
    requestAnimationFrame(() => this.resize(event))
  }

  onPanelMouseDown(event) {
    this.mousePosition = event.nativeEvent.x
    // Adds user-select: none to the body to prevent highlighting
    // everything when the user is dragging the resize panel
    document.body.classList.add('is-resizing')
    document.addEventListener('mousemove', this.resizePanel)
  }

  onMouseUp() {
    document.body.classList.remove('is-resizing')
    document.removeEventListener('mousemove', this.resizePanel)
  }

  renderTab(tab, index) {
    const { title, path, content, isLoading } = tab

    if (isLoading) {
      return (
        <Tab title={title} key={tab.index} hint={`Loading ${title}`}>
          <LoadingOverlay text={`Loading ${title}...`} />
        </Tab>
      )
    }

    const { language, canEditorRender, extension } = getLanguageFromFileName(
      title
    )

    return (
      <Tab title={title} key={index} hint={path}>
        {canEditorRender ? (
          <Editor
            fileName={title}
            content={atob(content)}
            colorScheme={this.props.mode}
          />
        ) : (
          <FileRenderer
            language={language}
            content={content}
            title={title}
            extension={extension}
            editorColorScheme={this.props.mode}
          />
        )}
      </Tab>
    )
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

  onSearchFinished() {
    this.setState({
      openedFilePaths: new Set(),
      openedTabs: [],
      isLoading: false
    })
  }

  toggleLoadingOverlay() {
    this.setState({ isLoading: !this.state.isLoading })
  }

  setActiveTabIndex(activeTabIndex) {
    this.setState({ activeTabIndex })
  }

  toggleExplorer() {
    this.setState({ isExplorerOpen: !this.state.isExplorerOpen })
  }

  render() {
    const colorClass = `${this.props.mode}-mode`
    const openClass = this.state.isExplorerOpen ? 'panel-open' : 'panel-closed'
    const { isExplorerOpen, activeTabIndex, openedTabs, isLoading } = this.state

    return (
      <div className={`app ${colorClass}`}>
        <div className="resize-overlay" />
        <div className={`left ${openClass}`}>
          <button className="panel-toggle" onClick={this.toggleExplorer}>
            {isExplorerOpen ? (
              <AiOutlineLeft className="panel-toggle-icon" />
            ) : (
              <AiOutlineMenu className="panel-toggle-icon" />
            )}
          </button>
          {isExplorerOpen ? null : <div className="mobile-panel-overlay" />}
          <ExplorerPanel
            onSelectFile={this.onSelectFile}
            onSearchFinished={this.onSearchFinished}
            onSearchStarted={this.toggleLoadingOverlay}
          />
        </div>
        <div className="right">
          <div className="resize-panel" onMouseDown={this.onPanelMouseDown}>
            <BsThreeDotsVertical className="resize-icon" />
          </div>
          {isLoading ? (
            <LoadingOverlay text="Loading repository..." />
          ) : (
            <TabView
              onTabClosed={this.onTabClosed}
              activeTabIndex={activeTabIndex}
              onSelectTab={this.setActiveTabIndex}
            >
              {openedTabs.map(this.renderTab)}
            </TabView>
          )}
        </div>
        <Gutter />
      </div>
    )
  }
}

App.propTypes = {
  mode: PropTypes.oneOf(['dark', 'light'])
}

App.defaultProps = {
  mode: 'light'
}

export default App
