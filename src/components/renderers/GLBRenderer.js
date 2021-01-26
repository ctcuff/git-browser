import '../../style/renderers/glb-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import Logger from '../../scripts/logger'

class GLBRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      hasError: false
    }

    this.init = this.init.bind(this)
    this.showError = this.showError.bind(this)
  }

  componentDidMount() {
    this.init()
  }

  async init() {
    this.setState({
      isLoading: true,
      hasError: false
    })

    try {
      import('@google/model-viewer')
      // Used to get rid of the outline that appears when dragging the model
      import('../../lib/focus-visible')
      this.setState({ isLoading: false })
    } catch (err) {
      Logger.error(err)
      this.setState({
        isLoading: false,
        hasError: true
      })
    }
  }

  showError() {
    this.setState({ error: true })
  }

  render() {
    const { extension, content } = this.props
    const mimeType =
      extension === '.glb' ? 'model/gltf-binary' : 'model/gltf+json'

    if (this.state.isLoading) {
      return <LoadingOverlay text="Loading libraries..." />
    }

    if (this.state.hasError) {
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
        error={this.showError}
        auto-rotate
        camera-controls
      />
    )
  }
}

GLBRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.gltf', '.glb'])
}

export default GLBRenderer
