import '../style/app.scss'
import React from 'react'
import Editor from './Editor'
import { parseCSSVar, setCSSVar } from '../scripts/util'
import PropTypes from 'prop-types'
import ExplorerPanel from './ExplorerPanel'
import GitHubAPI from '../scripts/github-api'
import Gutter from './Gutter'
import { Tab, TabView } from './Tabs'

const clamp = (min, value, max) => Math.max(min, Math.min(value, max))
class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      // Used to make sure the same tab can't be
      // opened multiple times
      openedFilePaths: new Set(),
      openedFiles: []
    }

    this.mousePosition = 0

    this.onSelectFile = this.onSelectFile.bind(this)
    this.onPanelMouseDown = this.onPanelMouseDown.bind(this)
    this.resizePanel = this.resizePanel.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onTabClosed = this.onTabClosed.bind(this)
    this.closeAllTabs = this.closeAllTabs.bind(this)
    this.renderTab = this.renderTab.bind(this)
    this.resize = this.resize.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  onSelectFile(node) {
    const { openedFilePaths, openedFiles } = this.state

    if (node.type === 'folder') {
      return
    }

    // Don't open this file in a new tab since it's already open
    if (openedFilePaths.has(node.path)) {
      return
    }

    GitHubAPI.getFile(node.url).then(content => {
      this.setState({
        openedFilePaths: new Set(openedFilePaths.add(node.path)),
        openedFiles: [
          ...openedFiles,
          {
            content: atob(content),
            name: node.name
          }
        ]
      })
    })
  }

  resize(event) {
    // The smallest the panel is allowed to be before
    // it snaps to 0px
    const absoluteMin = 60
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
    // reaches half of the panel's absolute minimum size
    if (event.x < absoluteMin / 2) {
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

  renderTab(file, index) {
    return (
      <Tab title={file.name} key={index}>
        <Editor
          fileName={file.name}
          content={file.content}
          colorScheme={this.props.mode}
        />
      </Tab>
    )
  }

  onTabClosed(closedIndex) {
    const openedFiles = this.state.openedFiles.filter((file, index) => {
      return closedIndex !== index
    })
    const openedFilePaths = new Set(openedFiles.map(node => node.path))

    this.setState({
      openedFilePaths,
      openedFiles
    })
  }

  closeAllTabs() {
    this.setState({
      openedFilePaths: new Set(),
      openedFiles: []
    })
  }

  render() {
    const colorClass = `${this.props.mode}-mode`

    return (
      <div className={`app ${colorClass}`}>
        <ExplorerPanel
          onSelectFile={this.onSelectFile}
          onSearchFinished={this.closeAllTabs}
        />
        <div className="right">
          <div className="resize-panel" onMouseDown={this.onPanelMouseDown} />
          <TabView onTabClosed={this.onTabClosed}>
            {this.state.openedFiles.map(this.renderTab)}
          </TabView>
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
