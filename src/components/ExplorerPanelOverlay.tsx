import '../style/explorer-panel-overlay.scss'
import React from 'react'

type ExplorerPanelOverlayProps = {
  panelActions: PanelAction[]
}

// Covers the explorer panel when the explorer is closed
// and adds button actions that toggle jump to each menu section
const ExplorerPanelOverlay = ({
  panelActions
}: ExplorerPanelOverlayProps): JSX.Element => (
  <div className="explorer-panel-overlay">
    {panelActions.map(action => (
      <button
        onClick={action.onClick}
        key={action.title}
        title={action.title}
        type="button"
      >
        {action.icon}
      </button>
    ))}
  </div>
)

export default ExplorerPanelOverlay
export type PanelAction = {
  onClick: () => void
  title: string
  icon: React.ReactNode
}
