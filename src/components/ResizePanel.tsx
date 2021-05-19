import '../style/resize-panel.scss'
import React from 'react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { parseCSSVar, setCSSVar } from '../scripts/util'

type ResizePanelProps = {
  isExplorerOpen: boolean
  onBreakPointClose: () => void
  onBreakPointOpen: () => void
}

// Used to ensure the editor panel stays within a certain size
const clamp = (min: number, value: number, max: number) => {
  return Math.max(min, Math.min(value, max))
}

// Controls the width of the explorer panel when dragged.
class ResizePanel extends React.Component<ResizePanelProps> {
  private mousePosition: number

  constructor(props: ResizePanelProps) {
    super(props)

    this.mousePosition = 0

    this.resize = this.resize.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.resizePanel = this.resizePanel.bind(this)
    this.onPanelMouseDown = this.onPanelMouseDown.bind(this)
  }

  componentDidMount(): void {
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillUnmount(): void {
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  onPanelMouseDown(event: React.MouseEvent): void {
    this.mousePosition = event.nativeEvent.x

    document.body.classList.add('is-resizing')
    document.addEventListener('mousemove', this.resizePanel)
  }

  onMouseUp(): void {
    document.body.classList.remove('is-resizing')
    document.removeEventListener('mousemove', this.resizePanel)
  }

  resize(event: MouseEvent): void {
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

  resizePanel(event: MouseEvent): void {
    requestAnimationFrame(() => this.resize(event))
  }

  render(): JSX.Element {
    return (
      <div className="resize-panel" onMouseDown={this.onPanelMouseDown}>
        <div className="resize-overlay" />
        <BsThreeDotsVertical className="resize-icon" />
      </div>
    )
  }
}

export default ResizePanel
