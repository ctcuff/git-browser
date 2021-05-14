import '../style/error-overlay.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { AiOutlineFileExcel } from 'react-icons/ai'

const ErrorOverlay = props => (
  <div className={`error-overlay ${props.className}`}>
    {props.showIcon && <AiOutlineFileExcel className="error-icon" />}
    <p className="error-message">{props.message}</p>
    {props.retryMessage && (
      <button onClick={props.onRetryClick} className="reload-btn">
        {props.retryMessage}
      </button>
    )}
  </div>
)

ErrorOverlay.propTypes = {
  onRetryClick: PropTypes.func,
  retryMessage: PropTypes.string,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  message: PropTypes.string.isRequired
}

ErrorOverlay.defaultProps = {
  showIcon: true,
  className: '',
  onRetryClick: () => {},
  retryMessage: ''
}

export default ErrorOverlay
