import '../style/app.scss'
import React from 'react'
import Editor from './Editor'
import { parseCSSVar, setCSSVar } from '../scripts/util'
import PropTypes from 'prop-types'
import ExplorerPanel from './ExplorerPanel'
import GitHubAPI from '../scripts/github-api'

const clamp = (min, value, max) => Math.max(min, Math.min(value, max))

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedFileName: '',
      selectedFileContents: ''
    }

    this.mousePosition = 0
    this.isMouseDown = false

    this.inputRef = React.createRef()
    this.rightPanelRef = React.createRef()
    this.leftPanelRef = React.createRef()

    this.onSelectFile = this.onSelectFile.bind(this)
    this.onPanelMouseDown = this.onPanelMouseDown.bind(this)
    this.resizePanel = this.resizePanel.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  onSelectFile(node) {
    if (node.type === 'folder') {
      return
    }

    GitHubAPI.getFile(node.url).then(content => {
      this.setState({
        selectedFileContents: atob(content),
        selectedFileName: node.name
      })
    })
  }

  resizePanel(event) {
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

  onPanelMouseDown(event) {
    const e = event.nativeEvent
    const borderSize = parseCSSVar('--resize-panel-border-width')

    if (e.offsetX < borderSize) {
      this.mousePosition = e.x
      document.body.classList.add('no-select')
      document.addEventListener('mousemove', this.resizePanel)
    }
  }

  onMouseUp() {
    document.body.classList.remove('no-select')
    document.removeEventListener('mousemove', this.resizePanel)
  }

  renderFile(type) {}

  render() {
    const colorClass = `${this.props.mode}-mode`

    return (
      <div className={`app ${colorClass}`}>
        <ExplorerPanel onSelectFile={this.onSelectFile} />
        <div
          className="right"
          onMouseDown={this.onPanelMouseDown}
          ref={this.rightPanelRef}
        >
          {this.state.selectedFileName ? (
            <Editor
              fileName={this.state.selectedFileName}
              content={this.state.selectedFileContents}
              colorScheme={this.props.mode}
            />
          ) : // <h1>No file selected</h1>
          null}
        </div>
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
