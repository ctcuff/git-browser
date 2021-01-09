import '../style/file-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import PDFRenderer from './renderers/PDFRenderer'
import ImageRenderer from './renderers/ImageRenderer'
import VideoRenderer from './renderers/VideoRenderer'
import AudioRenderer from './renderers/AudioRenderer'
import MarkdownRenderer from './renderers/MarkdownRenderer'
import CSVRenderer from './renderers/CSVRenderer'
import JupyterRenderer from './renderers/JupyterRenderer'
import { noop } from '../scripts/util'
import { VscCode } from 'react-icons/vsc'
import LoadingOverlay from './LoadingOverlay'
import ErrorOverlay from './ErrorOverlay'
import Logger from '../scripts/logger'

class FileRenderer extends React.Component {
  // File extensions that cause the Editor component to
  // display the "preview file" button. These files will be displayed as
  // human readable text by the renderers that render these files
  static validEditorExtensions = ['.svg', '.md', '.mdx', '.csv', '.ipynb']

  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      decodedContent: null
    }

    this.getComponent = this.getComponent.bind(this)
    this.forceRenderEditor = this.forceRenderEditor.bind(this)
    this.renderUnsupported = this.renderUnsupported.bind(this)
    this.renderPreviewButton = this.renderPreviewButton.bind(this)

    this.decodeWorker = new Worker('../scripts/encode-decode-worker.js', {
      type: 'module'
    })
  }

  componentDidMount() {
    const { content, extension } = this.props

    // Skip decoding if this file if it doesn't need to be displayed as text.
    // i.e.: Images, PDFs, audio, etc...
    if (!FileRenderer.validEditorExtensions.includes(extension)) {
      this.setState({ isLoading: false })
      return
    }

    // Decode base64 content on a separate thread to avoid UI freezes
    this.decodeWorker.postMessage({
      message: content,
      type: 'decode'
    })

    this.decodeWorker.onmessage = event => {
      this.setState({
        isLoading: false,
        decodedContent: event.data || null
      })
    }

    this.decodeWorker.onerror = event => {
      this.setState({ isLoading: false })
      Logger.error('Error decoding file', event.message)
    }
  }

  componentWillUnmount() {
    this.decodeWorker.terminate()
  }

  getComponent() {
    const { content, title, extension } = this.props
    const decodedContent = this.state.decodedContent

    // Files with decoded content display human readable text. If
    // we can't decode the content, display an unsupported message
    if (
      !decodedContent &&
      FileRenderer.validEditorExtensions.includes(extension)
    ) {
      return this.renderUnsupported()
    }

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
      case '.md':
      case '.mdx':
        return <MarkdownRenderer content={decodedContent} />
      case '.csv':
        return <CSVRenderer content={decodedContent} />
      case '.ipynb':
        return <JupyterRenderer content={decodedContent} />
      default:
        return this.renderUnsupported()
    }
  }

  renderUnsupported() {
    const message = `
    This file wasn't displayed because it's either binary
    or uses an unknown text encoding.
    `
    return (
      <ErrorOverlay
        message={message}
        retryMessage="Do you want to load it anyway?"
        onRetryClick={this.forceRenderEditor}
      />
    )
  }

  renderPreviewButton() {
    if (!FileRenderer.validEditorExtensions.includes(this.props.extension)) {
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

  // Let the App component know that ths file should
  // be rendered by the editor
  forceRenderEditor() {
    // The content may not have been properly decoded. If it
    // wasn't, we'll "force" decoding with atob
    const content = this.state.decodedContent || atob(this.props.content)
    this.props.onForceRender(content, true)
  }

  render() {
    if (this.state.isLoading) {
      return <LoadingOverlay text="Loading file..." />
    }

    return (
      <div className="file-renderer">
        {this.getComponent()}
        {this.renderPreviewButton()}
      </div>
    )
  }
}

FileRenderer.propTypes = {
  // "content" will be a base64 encoded string
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  extension: PropTypes.string.isRequired,
  onForceRender: PropTypes.func
}

FileRenderer.defaultProps = {
  onForceRender: noop
}

export default FileRenderer
