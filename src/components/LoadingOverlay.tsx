import '../style/loading-overlay.scss'
import React from 'react'
import { AiOutlineLoading } from 'react-icons/ai'

type LoadingOverlayProps = {
  className?: string
  text: string
}

const LoadingOverlay = (props: LoadingOverlayProps): JSX.Element => (
  <div className={`loading-overlay ${props.className}`}>
    <AiOutlineLoading className="loading-icon" />
    <p className="loading-text">{props.text}</p>
  </div>
)

LoadingOverlay.defaultProps = {
  className: ''
}

export default LoadingOverlay
