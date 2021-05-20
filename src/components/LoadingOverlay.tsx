import '../style/loading-overlay.scss'
import React from 'react'
import { AiOutlineLoading } from 'react-icons/ai'

type LoadingOverlayProps = {
  className?: string
  text: string
}

const LoadingOverlay = ({
  text,
  className = ''
}: LoadingOverlayProps): JSX.Element => (
  <div className={`loading-overlay ${className}`}>
    <AiOutlineLoading className="loading-icon" />
    <p className="loading-text">{text}</p>
  </div>
)

export default LoadingOverlay
