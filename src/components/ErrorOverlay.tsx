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

const ErrorOverlay = ({
  message,
  showIcon = true,
  className = '',
  onRetryClick = () => {},
  retryMessage = ''
}: ErrorOverlayProps): JSX.Element => (
  <div className={`error-overlay ${className}`}>
    {showIcon && <AiOutlineFileExcel className="error-icon" />}
    <p className="error-message">{message}</p>
    {retryMessage && (
      <button onClick={onRetryClick} className="reload-btn" type="button">
        {retryMessage}
      </button>
    )}
  </div>
)

export default ErrorOverlay
