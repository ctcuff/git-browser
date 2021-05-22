import '../style/file-renderer.scss'
import React from 'react'
import { VscCode } from 'react-icons/vsc'
import { connect, ConnectedProps } from 'react-redux'
import PDFRenderer from './renderers/PDFRenderer'
import ImageRenderer from './renderers/ImageRenderer'
import VideoRenderer from './renderers/VideoRenderer'
import AudioRenderer from './renderers/AudioRenderer'
import MarkdownRenderer from './renderers/MarkdownRenderer'
import CSVRenderer from './renderers/CSVRenderer'
import JupyterRenderer from './renderers/JupyterRenderer'
import AsciiDocRenderer from './renderers/AsciiDocRenderer'
import ModelRenderer from './renderers/ModelRenderer'
import FontRenderer from './renderers/FontRenderer'
import EmbeddedDocRenderer from './renderers/EmbeddedDocRenderer'
import ZipRenderer from './renderers/ZipRenderer'
import PSDRenderer from './renderers/PSDRenderer'
import WasmRenderer from './renderers/WasmRenderer'
import LoadingOverlay from './LoadingOverlay'
import ErrorOverlay from './ErrorOverlay'
import Logger from '../scripts/logger'
import Editor from './Editor'
import URLUtil from '../scripts/url-util'
import { State } from '../store'

const mapStateToProps = (state: State) => ({
  repoPath: state.search.repoPath,
  branch: state.search.branch
})

const connector = connect(mapStateToProps)

type FileRendererProps = ConnectedProps<typeof connector> & {
  /**
   * base64 encoded
   */
  content: string
  wasForceRendered: boolean
  fileName: string
  extension: string
  onForceRender: (content: string, canEditorRender: boolean) => void
  filePath: string
}

type FileRendererState = {
  isLoading: boolean
  decodedContent: string | null
  hasError: boolean
}

class FileRenderer extends React.Component<
  FileRendererProps,
  FileRendererState
> {
  private decodeWorker: Worker

  constructor(props: FileRendererProps) {
    super(props)

    this.state = {
      isLoading: true,
      decodedContent: null,
      hasError: false
    }

    this.getComponent = this.getComponent.bind(this)
    this.forceRenderEditor = this.forceRenderEditor.bind(this)
    this.renderUnsupported = this.renderUnsupported.bind(this)
    this.renderPreviewButton = this.renderPreviewButton.bind(this)
    this.decodeContent = this.decodeContent.bind(this)

    this.decodeWorker = new Worker(
      new URL('../scripts/encode-decode.worker.ts', import.meta.url)
    )
  }

  componentDidMount(): void {
    const { content, extension, wasForceRendered } = this.props

    // Skip decoding if this file if it doesn't need to be displayed as text.
    // i.e.: Images, PDFs, audio, etc...
    if (!Editor.previewExtensions.has(extension)) {
      this.setState({ isLoading: false })
      return
    }

    // Skip decoding if this file was force rendered since the text is
    // already in a human-readable form
    if (wasForceRendered && Editor.textExtensions.has(extension)) {
      this.setState({
        decodedContent: content,
        isLoading: false
      })
      return
    }

    if (content && !content.trim()) {
      this.setState({
        decodedContent: '',
        isLoading: false
      })
      return
    }

    // Decode base64 content on a separate thread to avoid UI freezes
    this.decodeContent()
  }

  componentWillUnmount(): void {
    this.decodeWorker.terminate()
  }

  getComponent(): JSX.Element {
    // prettier-ignore
    const {
      content,
      fileName,
      extension,
      repoPath,
      branch,
      filePath
    } = this.props
    const { decodedContent } = this.state
    const fileURL = URLUtil.buildGithubFileURL({
      repoPath,
      branch,
      filePath,
      raw: true
    })

    // Files with human readable text need to be decoded. If
    // we can't decode the content, display an unsupported message
    if (decodedContent === null && Editor.previewExtensions.has(extension)) {
      return this.renderUnsupported()
    }

    // Occurs if an empty string was passed to this component
    if (!content?.trim() && !decodedContent?.trim()) {
      return <ErrorOverlay message="No content to preview." showIcon={false} />
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
      case '.bmp':
        return (
          <ImageRenderer
            content={content}
            extension={extension}
            alt={fileName}
          />
        )
      case '.pdf':
        return <PDFRenderer content={content} />
      case '.mp4':
      case '.webm':
        return <VideoRenderer content={content} extension={extension} />
      case '.mp3':
      case '.wav':
      case '.ogg':
      case '.aac':
        return <AudioRenderer content={content} extension={extension} />
      case '.glb':
      case '.gltf':
        return <ModelRenderer content={content} extension={extension} />
      case '.eot':
      case '.otf':
      case '.ttf':
      case '.woff':
      case '.woff2':
        return <FontRenderer content={content} extension={extension} />
      case '.zip':
        return <ZipRenderer content={content} />
      case '.md':
      case '.mdx':
        return <MarkdownRenderer content={decodedContent || ''} />
      case '.adoc':
        return <AsciiDocRenderer content={decodedContent || ''} />
      case '.csv':
      case '.tsv':
        return <CSVRenderer content={decodedContent || ''} />
      case '.ipynb':
        return <JupyterRenderer content={decodedContent || ''} />
      case '.doc':
      case '.docx':
      case '.ppt':
      case '.pptx':
      case '.xls':
      case '.xlsx':
        return <EmbeddedDocRenderer fileURL={fileURL} />
      case '.psd':
        return <PSDRenderer content={content} fileName={fileName} />
      case '.wasm':
        return <WasmRenderer content={content} />
      default:
        return this.renderUnsupported()
    }
  }

  decodeContent(): void {
    this.setState({
      isLoading: true,
      hasError: false
    })

    this.decodeWorker.postMessage({
      message: this.props.content,
      type: 'decode'
    })

    this.decodeWorker.onmessage = event => {
      // decodedContent will be null if the content couldn't
      // be properly decoded for some reason
      this.setState({
        isLoading: false,
        decodedContent: event.data
      })
    }

    this.decodeWorker.onerror = event => {
      this.setState({
        isLoading: false,
        hasError: true
      })
      Logger.error('Error decoding file', event)
    }
  }

  // Let the App component know that this file should
  // be rendered by the editor
  forceRenderEditor(): void {
    const content = this.state.decodedContent

    if (content) {
      this.props.onForceRender(content, true)
      return
    }

    this.setState({ isLoading: true })

    // The content may not have been properly decoded when this
    // component was mounted (this happens with files that can't
    // be displayed as text). If it wasn't, we'll try to "force"
    // decoding with atob
    this.decodeWorker.postMessage({
      type: 'decode',
      message: this.props.content,
      raw: true
    })

    this.decodeWorker.onmessage = event => {
      this.setState({ isLoading: false })
      this.props.onForceRender(event.data, true)
    }

    this.decodeWorker.onerror = error => {
      this.setState({ isLoading: false })
      Logger.error(error)
    }
  }

  renderPreviewButton(): JSX.Element | null {
    if (!Editor.previewExtensions.has(this.props.extension)) {
      return null
    }

    return (
      <button
        className="editor-preview-btn"
        title="View as code"
        onClick={this.forceRenderEditor}
        type="button"
      >
        <VscCode />
      </button>
    )
  }

  renderUnsupported(): JSX.Element {
    const message = `
      This file wasn't displayed because it's either binary
      or uses an unknown text encoding.
    `
    return (
      <ErrorOverlay
        className="file-renderer-unsupported"
        message={message}
        retryMessage="Do you want to load it anyway?"
        onRetryClick={this.forceRenderEditor}
      />
    )
  }

  render(): JSX.Element {
    if (this.state.isLoading) {
      return <LoadingOverlay text="Loading file..." />
    }

    if (this.state.hasError) {
      return (
        <ErrorOverlay message="An error occurred while loading the preview." />
      )
    }

    return (
      <div className="file-renderer">
        {this.getComponent()}
        {this.renderPreviewButton()}
      </div>
    )
  }
}

export default connector(FileRenderer)
