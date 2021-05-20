import '../../style/renderers/video-renderer.scss'
import React, { useState } from 'react'
import ErrorOverlay from '../ErrorOverlay'
import LoadingOverlay from '../LoadingOverlay'

type VideoRendererProps = {
  /**
   * base64 encoded
   */
  content: string
  extension: '.mp4' | '.webm'
}

const VideoRenderer = (props: VideoRendererProps): JSX.Element => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const mimeType = `video/${props.extension.slice(1)}`

  const onError = (): void => {
    setHasError(true)
    setLoading(false)
  }

  const onReloadClick = (): void => {
    setHasError(false)
    setLoading(true)
  }

  const onVideoLoad = (): void => setLoading(false)

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

export default VideoRenderer
