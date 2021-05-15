import '../style/resize-panel.scss'
import React from 'react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import PropTypes from 'prop-types'
import { parseCSSVar, setCSSVar } from '../scripts/util'

// Used to ensure the editor panel stays within a certain size
const clamp = (min, value, max) => Math.max(min, Math.min(value, max))

// Controls the width of the explorer panel when dragged.
class ResizePanel extends React.Component {
  constructor(props) {
    super(props)

    this.mousePosition = 0

    this.resize = this.resize.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.resizePanel = this.resizePanel.bind(this)
    this.onPanelMouseDown = this.onPanelMouseDown.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  onPanelMouseDown(event) {
    this.mousePosition = event.nativeEvent.x

    document.body.classList.add('is-resizing')
    document.addEventListener('mousemove', this.resizePanel)
  }

  onMouseUp() {
    document.body.classList.remove('is-resizing')
    document.removeEventListener('mousemove', this.resizePanel)
  }

  resize(event) {
    // The smallest the explorer is allowed to be before it snaps closed
    const absoluteMin = 150
    const absoluteMax = document.body.clientWidth - 100
    const diff = this.mousePosition - event.x
    const panelSize = parseCSSVar('--file-explorer-width')
    const { isExplorerOpen, onBreakPointClose, onBreakPointOpen } = this.props

    // Ensures that the panel can only shrink to the size of body - absoluteMin
    // and grow only to the size of the page - absoluteMax
    const newSize = clamp(absoluteMin, panelSize - diff, absoluteMax)

    // Setting the mouse position to the new size of the panel
    // emulates vscode's way of shrinking the file explorer. This
    // ensures that the size of panel doesn't go past the position of the mouse
    this.mousePosition = newSize

    // Snaps the panel closed when the cursor position
    // reaches half the panel's absolute minimum size
    if (event.x < absoluteMin / 2) {
      if (isExplorerOpen) {
        onBreakPointClose()
      }
    } else if (!isExplorerOpen) {
      onBreakPointOpen()
    }

    setCSSVar('--file-explorer-width', `${newSize}px`)
  }

  resizePanel(event) {
    requestAnimationFrame(() => this.resize(event))
  }

  render() {
    return (
      <div className="resize-panel" onMouseDown={this.onPanelMouseDown}>
        <div className="resize-overlay" />
        <BsThreeDotsVertical className="resize-icon" />
      </div>
    )
  }
}

ResizePanel.propTypes = {
  isExplorerOpen: PropTypes.bool.isRequired,
  onBreakPointClose: PropTypes.func.isRequired,
  onBreakPointOpen: PropTypes.func.isRequired
}

export default ResizePanel
