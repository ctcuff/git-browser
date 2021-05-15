import '../../style/renderers/model-renderer.scss'
import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import Logger from '../../scripts/logger'
import Collapse from '../Collapse'

const ModelRenderer = ({ content, extension }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [modelAnimations, setModelAnimations] = useState([])
  const [selectedAnimation, setSelectedAnimation] = useState('')
  const [modelViewer, setModelViewer] = useState(null)
  const [isModelVisible, setIsModelVisible] = useState(false)

  let animationCheckInterval

  // Attaching events to the custom element won't actually fire
  // those events. We need to poll the element to make sure the
  // model was loaded successfully
  const checkIfModelLoaded = modelViewerNode => {
    let timer = 0
    const timeout = 5 * 1000
    const intervalTime = 20

    animationCheckInterval = setInterval(() => {
      timer += intervalTime

      // model-viewer doesn't have it's available animations ready immediately after
      // it's loaded the model so we need to keep checking to see if the model
      // actually has any animations.
      if (modelViewerNode.loaded) {
        clearInterval(animationCheckInterval)
        setModelAnimations(modelViewerNode.availableAnimations || [])
        setIsModelVisible(true)
        setIsLoading(false)
        return
      }

      if (timer > timeout) {
        if (!modelViewerNode.modelIsVisible) {
          setHasError(true)
          setIsLoading(false)
        }

        clearInterval(animationCheckInterval)
      }
    }, intervalTime)
  }

  const modelViewerRef = useCallback(modelViewerNode => {
    setModelViewer(modelViewerNode)

    if (modelViewerNode) {
      checkIfModelLoaded(modelViewerNode)
    }
  }, [])

  const playAnimation = animationName => {
    if (!modelViewer) {
      return
    }

    let newAnimation = animationName

    // If the same animation was selected, pause the model
    if (selectedAnimation === animationName) {
      newAnimation = ''
      modelViewer.pause()
    } else {
      newAnimation = animationName
      modelViewer.animationName = newAnimation
      modelViewer.play()
    }

    setSelectedAnimation(newAnimation)
  }

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
    extension === '.glb' ? 'model/gltf-binary' : 'model/gltf-json'

  useEffect(() => {
    init()
    return () => clearInterval(animationCheckInterval)
  }, [])

  if (isLoading) {
    return <LoadingOverlay text="Loading libraries..." />
  }

  if (hasError) {
    return (
      <ErrorOverlay
        message={`
          An error occurred while loading this model. ${
            extension === '.gltf'
              ? 'Some gltf, models cannot be loaded if the model requires external textures.'
              : ''
          }
        `}
        retryMessage="Retry"
        onRetryClick={init}
      />
    )
  }

  return (
    <div className="model-renderer">
      {!isModelVisible && <LoadingOverlay text="Loading model..." />}
      {modelAnimations.length > 0 && (
        <Collapse className="model-animations" title="animations" open>
          {modelAnimations.map(animationName => (
            <button
              className={`animation-btn ${
                selectedAnimation === animationName ? 'active' : ''
              }`}
              type="button"
              key={animationName}
              title={animationName}
              onClick={() => playAnimation(animationName)}
            >
              {animationName}
            </button>
          ))}
        </Collapse>
      )}
      <model-viewer
        class="model"
        ref={modelViewerRef}
        src={`data:${mimeType};base64,${content}`}
        max-field-of-view="120deg"
        interaction-prompt="none"
        camera-controls
      />
    </div>
  )
}

ModelRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.gltf', '.glb']).isRequired
}

export default ModelRenderer
