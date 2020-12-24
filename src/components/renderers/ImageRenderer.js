import '../../style/image-renderer.scss'
import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'

const ImageRenderer = props => {
  const imageRef = useRef(null)
  const [isLoading, setLoading] = useState(true)
  const [hasError, setError] = useState(false)
  let encoding

  switch (props.extension) {
    case '.svg':
      encoding = 'svg+xml'
      break
    case '.png':
    case '.jpg':
    case '.jpeg':
    default:
      encoding = 'png'
  }

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

  return (
    <div className={`image-renderer ${isLoading ? 'is-loading' : null}`}>
      {isLoading && <LoadingOverlay text="Rendering image..." />}
      {hasError && (
        <ErrorOverlay
          message="Error loading image."
          retryMessage="Retry"
          onRetryClick={retry}
        />
      )}
      {!hasError && (
        <img
          src={`data:image/${encoding};base64,${props.content}`}
          ref={imageRef}
          alt={props.alt}
          onLoad={onImageLoaded}
          onError={onLoadError}
        />
      )}
    </div>
  )
}

ImageRenderer.propTypes = {
  alt: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.svg', '.png', '.jpg', '.jpeg', '.ico'])
    .isRequired
}

export default ImageRenderer
