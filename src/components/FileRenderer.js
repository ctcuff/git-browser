import '../style/file-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import PDFRenderer from './renderers/PDFRenderer'
import ImageRenderer from './renderers/ImageRenderer'
import VideoRenderer from './renderers/VideoRenderer'
import AudioRenderer from './renderers/AudioRenderer'

class FileRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.getComponent = this.getComponent.bind(this)
    this.forceRenderEditor = this.forceRenderEditor.bind(this)
    this.renderUnsupported = this.renderUnsupported.bind(this)
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

  forceRenderEditor() {
    this.props.onForceRender(atob(this.props.content))
  }

  render() {
    return <div className="file-renderer">{this.getComponent()}</div>
  }
}

FileRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  extension: PropTypes.string.isRequired,
  onForceRender: PropTypes.func.isRequired
}

export default FileRenderer
