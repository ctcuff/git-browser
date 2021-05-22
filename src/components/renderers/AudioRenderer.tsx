import '../../style/renderers/audio-renderer.scss'
import React, { useState } from 'react'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'

type AudioRendererProps = {
  /**
   * base64 encoded
   */
  content: string
  extension: '.mp3' | '.wav' | '.ogg' | '.aac'
}

const AudioRenderer = (props: AudioRendererProps): JSX.Element => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const mimeType = `audio/${props.extension.slice(1)}`

  const onLoadError = (): void => {
    setHasError(true)
    setLoading(false)
  }

  const onAudioLoad = (): void => setLoading(false)

  const onRetryClick = (): void => {
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

export default AudioRenderer
