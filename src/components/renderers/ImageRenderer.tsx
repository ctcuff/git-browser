import '../../style/renderers/image-renderer.scss'
import React, { useState } from 'react'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import ImageGrid from '../ImageGrid'
import Logger from '../../scripts/logger'

type ImageRendererProps = {
  /**
   * base64 encoded
   */
  content: string
  alt: string
  extension:
    | '.apng' //  MIME Type: image/apng
    | '.avif' //  MIME Type: image/avif
    | '.gif' //  MIME Type: image/gif
    | '.jpg' //  MIME Type: image/jpeg
    | '.jpeg' //  MIME Type: image/jpeg
    | '.jfif' //  MIME Type: image/jpeg
    | '.pjpeg' //  MIME Type: image/jpeg
    | '.pjp' //  MIME Type: image/jpeg
    | '.bmp' //  MIME Type: image/png
    | '.png' //  MIME Type: image/png
    | '.svg' //  MIME Type: image/svg+xml
    | '.webp' //  MIME Type: image/webp
    | '.ico' //  MIME Type: image/x-icon
}

const getMimeType = (extension: string): string => {
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

const ImageRenderer = ({
  extension,
  alt,
  content
}: ImageRendererProps): JSX.Element => {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setError] = useState(false)
  const mimeType = getMimeType(extension)

  const onImageLoaded = (): void => setLoading(false)

  const onLoadError = (): void => {
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

export default ImageRenderer
