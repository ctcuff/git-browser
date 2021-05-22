import '../../style/renderers/embedded-doc-renderer.scss'
import React from 'react'
import LoadingOverlay from '../LoadingOverlay'

type DocumentRendererProps = {
  fileURL: string
}

const buildPreviewURL = (url: string): string =>
  `https://docs.google.com/viewer?url=${url}&embedded=true`

const EmbeddedDocRenderer = ({
  fileURL
}: DocumentRendererProps): JSX.Element => (
  <div className="embedded-doc-renderer">
    <LoadingOverlay className="doc-loading-overlay" text="Loading preview..." />
    <iframe src={buildPreviewURL(fileURL)} title="Document Preview" />
  </div>
)

export default EmbeddedDocRenderer
