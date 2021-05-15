import '../../style/renderers/embedded-doc-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'

const buildPreviewURL = url =>
  `https://docs.google.com/viewer?url=${url}&embedded=true`

const EmbeddedDocRenderer = props => (
  <div className="embedded-doc-renderer">
    <LoadingOverlay className="doc-loading-overlay" text="Loading preview..." />
    <iframe src={buildPreviewURL(props.fileURL)} title="Document Preview" />
  </div>
)

EmbeddedDocRenderer.propTypes = {
  fileURL: PropTypes.string.isRequired
}

export default EmbeddedDocRenderer
