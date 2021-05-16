import '../../style/renderers/image-renderer.scss'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import ImageGrid from '../ImageGrid'
import Logger from '../../scripts/logger'

const getMimeType = extension => {
  let type = ''

  switch (extension) {
    case '.apng':
    case '.avif':
    case '.gif':
    case '.webp':
      type = extension.slice(1)
      break
    case '.bmp':
    case '.png':
      type = 'png'
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

  return `image/${type}`
}

const ImageRenderer = ({ extension, alt, content }) => {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setError] = useState(false)
  const mimeType = getMimeType(extension)

  const onImageLoaded = () => setLoading(false)

  const onLoadError = () => {
    setLoading(false)
    setError(true)
  }

  if (hasError) {
    return (
      <ErrorOverlay message="An error occurred while loading this image." />
    )
  }

  return (
    <div className="image-renderer">
      {isLoading && <LoadingOverlay text="Rendering image..." />}
      <img
        src={`data:${mimeType};base64,${content}`}
        className={isLoading ? 'img--loading' : ''}
        alt={alt}
        onLoad={onImageLoaded}
        onError={onLoadError}
      />
      <ImageGrid />
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
    '.bmp',
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
