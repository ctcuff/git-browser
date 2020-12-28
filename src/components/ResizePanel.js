import '../style/resize-panel.scss'
import React from 'react'
import { parseCSSVar, setCSSVar } from '../scripts/util'
import { BsThreeDotsVertical } from 'react-icons/bs'

// Used to ensure the editor panel stays within a certain size
const clamp = (min, value, max) => Math.max(min, Math.min(value, max))

// Controls the width of the explorer panel when dragged.
// This is a separate component so that the resize panel
// won't overlap the scrollbar in the explorer panel.
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

    document.body.classList.add('is-resizing')
    document.addEventListener('mousemove', this.resizePanel)
  }

  onMouseUp() {
    document.body.classList.remove('is-resizing')
    document.removeEventListener('mousemove', this.resizePanel)
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

export default ResizePanel
