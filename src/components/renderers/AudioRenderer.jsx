import '../../style/renderers/audio-renderer.scss'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'

const AudioRenderer = props => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const mimeType = `audio/${props.extension.slice(1)}`

  const onLoadError = () => {
    setHasError(true)
    setLoading(false)
  }

  const onAudioLoad = () => setLoading(false)

  const onRetryClick = () => {
    setHasError(false)
    setLoading(true)
  }

  if (hasError) {
    return (
      <ErrorOverlay
        message="Error loading audio file."
        retryMessage="Retry"
        onRetryClick={onRetryClick}
      />
    )
  }

  return (
    <div className="audio-renderer">
      {isLoading && <LoadingOverlay text="Loading audio..." />}
      <audio
        controls
        onError={onLoadError}
        onLoadedData={onAudioLoad}
        className={isLoading ? 'audio--loading' : ''}
      >
        <source
          type={mimeType}
          src={`data:${mimeType};base64,${props.content}`}
        />
      </audio>
    </div>
  )
}

AudioRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.mp3', '.wav', '.ogg', '.aac']).isRequired
}

export default AudioRenderer
