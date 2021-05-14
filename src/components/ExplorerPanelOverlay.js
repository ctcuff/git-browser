import '../style/explorer-panel-overlay.scss'
import React from 'react'
import PropTypes from 'prop-types'

// Covers the explorer panel when the explorer is closed
// and adds button actions that toggle jump to each menu section
const ExplorerPanelOverlay = props => (
  <div className="explorer-panel-overlay">
    {props.panelActions.map((action, index) => (
      <button onClick={action.onClick} key={index} title={action.title}>
        {action.icon}
      </button>
    ))}
  </div>
)

ExplorerPanelOverlay.propTypes = {
  panelActions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired
    }).isRequired
  ).isRequired
}

export default ExplorerPanelOverlay
