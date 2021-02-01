import '../../style/renderers/embedded-doc-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'

const buildPreviewURL = URL => {
  return `https://docs.google.com/viewer?url=${URL}&embedded=true`
}

const EmbeddedDocRenderer = props => {
  const URL = buildPreviewURL(props.fileURL)

  return (
    <div className="embedded-doc-renderer">
      <LoadingOverlay
        className="doc-loading-overlay"
        text="Loading preview..."
      />
      <iframe src={URL} />
    </div>
  )
}

EmbeddedDocRenderer.propTypes = {
  fileURL: PropTypes.string.isRequired
}

export default EmbeddedDocRenderer
