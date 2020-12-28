import '../style/file-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import PDFRenderer from './renderers/PDFRenderer'
import ImageRenderer from './renderers/ImageRenderer'
import VideoRenderer from './renderers/VideoRenderer'
import AudioRenderer from './renderers/AudioRenderer'
import { noop } from '../scripts/util'
import { VscCode } from 'react-icons/vsc'

class FileRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.getComponent = this.getComponent.bind(this)
    this.forceRenderEditor = this.forceRenderEditor.bind(this)
    this.renderUnsupported = this.renderUnsupported.bind(this)
    this.renderPreviewButton = this.renderPreviewButton.bind(this)
  }

  getComponent() {
    const { content, title, extension } = this.props

    switch (extension) {
      case '.apng':
      case '.avif':
      case '.gif':
      case '.png':
      case '.webp':
      case '.jpg':
      case '.jpeg':
      case '.jfif':
      case '.pjpeg':
      case '.pjp':
      case '.svg':
      case '.ico':
        return (
          <ImageRenderer content={content} extension={extension} alt={title} />
        )
      case '.pdf':
        return <PDFRenderer content={content} />
      case '.mp4':
      case '.webm':
        return <VideoRenderer content={content} extension={extension} />
      case '.mp3':
      case '.wav':
      case '.ogg':
        return <AudioRenderer content={content} extension={extension} />
      default:
        return this.renderUnsupported()
    }
  }

  renderUnsupported() {
    return (
      <div className="unsupported">
        <p>
          This file is not displayed because it&apos;s either binary or uses an
          unknown text encoding.
        </p>
        <button className="render-editor-btn" onClick={this.forceRenderEditor}>
          Do you want to load it anyway?
        </button>
      </div>
    )
  }

  renderPreviewButton() {
    const validExtensions = ['.svg', '.md']

    if (!validExtensions.includes(this.props.extension)) {
      return null
    }

    return (
      <button
        className="editor-preview-btn"
        title="View as code"
        onClick={this.forceRenderEditor}
      >
        <VscCode />
      </button>
    )
  }

  forceRenderEditor() {
    // Let the App component know that ths file should
    // be rendered by the editor
    this.props.onForceRender(atob(this.props.content), true)
  }

  render() {
    return (
      <div className="file-renderer">
        {this.getComponent()}
        {this.renderPreviewButton()}
      </div>
    )
  }
}

FileRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  extension: PropTypes.string.isRequired,
  onForceRender: PropTypes.func
}

FileRenderer.defaultProps = {
  onForceRender: noop
}

export default FileRenderer
