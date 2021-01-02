import '../style/loading-overlay.scss'
import React from 'react'
import { AiOutlineLoading } from 'react-icons/ai'
import PropTypes from 'prop-types'

const LoadingOverlay = props => (
  <div className={`loading-overlay ${props.className}`}>
    <AiOutlineLoading className="loading-icon" />
    <p className="loading-text">{props.text}</p>
  </div>
)

LoadingOverlay.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string
}

LoadingOverlay.defaultProps = {
  className: ''
}

export default LoadingOverlay
