import '../style/error-overlay.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { AiOutlineFileExcel } from 'react-icons/ai'

const ErrorOverlay = props => (
  <div className="error-overlay">
    <AiOutlineFileExcel className="error-icon" />
    <p className="error-message">{props.message}</p>
    {props.retryMessage && (
      <button onClick={props.onRetryClick} className="reload-btn">
        {props.retryMessage}
      </button>
    )}
  </div>
)

ErrorOverlay.propTypes = {
  message: PropTypes.string.isRequired,
  onRetryClick: PropTypes.func,
  retryMessage: PropTypes.string
}

export default ErrorOverlay
