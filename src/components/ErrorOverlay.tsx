import '../style/error-overlay.scss'
import React from 'react'
import { AiOutlineFileExcel } from 'react-icons/ai'

type ErrorOverlayProps = {
  message: string
  onRetryClick?: () => void
  retryMessage?: string
  showIcon?: boolean
  className?: string
}

const ErrorOverlay = (props: ErrorOverlayProps): JSX.Element => (
  <div className={`error-overlay ${props.className}`}>
    {props.showIcon && <AiOutlineFileExcel className="error-icon" />}
    <p className="error-message">{props.message}</p>
    {props.retryMessage && (
      <button onClick={props.onRetryClick} className="reload-btn" type="button">
        {props.retryMessage}
      </button>
    )}
  </div>
)

ErrorOverlay.defaultProps = {
  showIcon: true,
  className: '',
  onRetryClick: () => {},
  retryMessage: ''
}

export default ErrorOverlay
