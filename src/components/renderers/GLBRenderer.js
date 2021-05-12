import '../../style/renderers/glb-renderer.scss'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import Logger from '../../scripts/logger'

const GLBRenderer = ({ content, extension }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const init = async () => {
    setIsLoading(true)
    setHasError(false)

    try {
      import('@google/model-viewer')
      // Used to get rid of the outline that appears when dragging the model
      import('../../lib/focus-visible')
      setIsLoading(false)
    } catch (err) {
      Logger.error(err)
      setIsLoading(false)
      setHasError(true)
    }
  }

  const mimeType =
    extension === '.glb' ? 'model/gltf-binary' : 'model/gltf+json'

  useEffect(() => {
    init()
  }, [])

  if (isLoading) {
    return <LoadingOverlay text="Loading libraries..." />
  }

  if (hasError) {
    return (
      <ErrorOverlay
        message="An error occurred while loading the model."
        retryMessage="Retry"
        onRetryClick={this.init}
      />
    )
  }

  return (
    <model-viewer
      src={`data:${mimeType};base64,${content}`}
      error={() => setHasError(true)}
      auto-rotate
      camera-controls
    />
  )
}

GLBRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.gltf', '.glb'])
}

export default GLBRenderer
