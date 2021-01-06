import '../../style/image-renderer.scss'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import Logger from '../../scripts/logger'
import { GrGrid } from 'react-icons/gr'

const getMimeType = extension => {
  let type = ''

  switch (extension) {
    case '.apng':
    case '.avif':
    case '.gif':
    case '.png':
    case '.webp':
      type = extension.slice(1)
      break
    case '.jpg':
    case '.jpeg':
    case '.jfif':
    case '.pjpeg':
    case '.pjp':
      type = 'jpeg'
      break
    case '.svg':
      type = 'svg+xml'
      break
    case '.ico':
      type = 'x-icon'
      break
    default:
      Logger.warn('Invalid extension', extension)
  }

  return 'image/' + type
}

const ImageRenderer = props => {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setError] = useState(false)
  const [hasGrid, toggleGrid] = useState(true)
  const mimeType = getMimeType(props.extension)

  const onImageLoaded = () => {
    setLoading(false)
  }

  const onLoadError = () => {
    setLoading(false)
    setError(true)
  }

  const retry = () => {
    setLoading(true)
    setError(false)
  }

  const toggleBackgroundClass = () => {
    toggleGrid(!hasGrid)
  }

  if (hasError) {
    return (
      <ErrorOverlay
        message="Error loading image."
        retryMessage="Retry"
        onRetryClick={retry}
      />
    )
  }

  return (
    <div className={`image-renderer ${hasGrid ? 'has-grid' : ''}`}>
      {isLoading && <LoadingOverlay text="Rendering image..." />}
      <img
        src={`data:${mimeType};base64,${props.content}`}
        className={isLoading ? 'img--loading' : ''}
        alt={props.alt}
        onLoad={onImageLoaded}
        onError={onLoadError}
      />
      <button className="grid-toggle" onClick={toggleBackgroundClass}>
        <GrGrid title="Toggle background" />
      </button>
    </div>
  )
}

ImageRenderer.propTypes = {
  alt: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf([
    // MIME Type: image/apng
    '.apng',
    // MIME Type: image/avif
    '.avif',
    // MIME Type: image/gif
    '.gif',
    // MIME Type: image/jpeg
    '.jpg',
    '.jpeg',
    '.jfif',
    '.pjpeg',
    '.pjp',
    // MIME Type: image/png
    '.png',
    // MIME Type: image/svg+xml
    '.svg',
    // MIME Type: image/webp
    '.webp',
    // MIME Type: image/x-icon
    '.ico'
  ]).isRequired
}

export default ImageRenderer
