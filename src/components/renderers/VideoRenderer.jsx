import '../../style/renderers/video-renderer.scss'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ErrorOverlay from '../ErrorOverlay'
import LoadingOverlay from '../LoadingOverlay'

const VideoRenderer = props => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const mimeType = `video/${props.extension.slice(1)}`

  const onError = () => {
    setHasError(true)
    setLoading(false)
  }

  const onReloadClick = () => {
    setHasError(false)
    setLoading(true)
  }

  const onVideoLoad = () => setLoading(false)

  if (hasError) {
    return (
      <div className="video-renderer">
        <ErrorOverlay
          message="Error loading video."
          retryMessage="Retry"
          onRetryClick={onReloadClick}
        />
      </div>
    )
  }

  return (
    <div className="video-renderer">
      {isLoading && <LoadingOverlay text="Loading video..." />}
      <video
        controls
        onError={onError}
        onLoadedData={onVideoLoad}
        className={isLoading ? 'video--loading' : ''}
      >
        <source
          type={mimeType}
          src={`data:${mimeType};base64,${props.content}`}
        />
      </video>
    </div>
  )
}

VideoRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.mp4', '.webm']).isRequired
}

export default VideoRenderer
