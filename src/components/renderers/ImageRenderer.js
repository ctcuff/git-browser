import '../../style/renderers/image-renderer.scss'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import Logger from '../../scripts/logger'
import { GrGrid } from 'react-icons/gr'
import { connect } from 'react-redux'

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

  return 'image/' + type
}

const ImageRenderer = props => {
  const { extension, alt, content, theme } = props
  const [isLoading, setLoading] = useState(true)
  const [hasError, setError] = useState(false)
  const [hasGrid, toggleGrid] = useState(false)
  const [gridClass, setGridClass] = useState('')
  const mimeType = getMimeType(extension)

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

  useEffect(() => {
    const { userTheme, preferredTheme } = theme

    // Need to set the theme of the background grid when the theme changes.
    // If the theme is auto, we'll use the user's preferred theme based on
    // their system settings.
    setGridClass(userTheme === 'theme-auto' ? preferredTheme : userTheme)
  }, [theme])

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
    <div className={`image-renderer ${hasGrid ? 'has-grid' : ''} ${gridClass}`}>
      {isLoading && <LoadingOverlay text="Rendering image..." />}
      <img
        src={`data:${mimeType};base64,${content}`}
        className={isLoading ? 'img--loading' : ''}
        alt={alt}
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
    '.bmp',
    '.png',
    // MIME Type: image/svg+xml
    '.svg',
    // MIME Type: image/webp
    '.webp',
    // MIME Type: image/x-icon
    '.ico'
  ]).isRequired,
  theme: PropTypes.shape({
    userTheme: PropTypes.oneOf[('theme-dark', 'theme-light', 'theme-auto')],
    preferredTheme: PropTypes.oneOf[('theme-dark', 'theme-light')]
  }).isRequired
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(ImageRenderer)
