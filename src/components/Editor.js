import '../style/editor.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { parseCSSVar } from '../scripts/util'
import LoadingOverlay from './LoadingOverlay'
import { AiOutlineEye } from 'react-icons/ai'
import { connect } from 'react-redux'
import Logger from '../scripts/logger'

class Editor extends React.Component {
  // File extensions that cause the component to display
  // the "preview file" button.
  static previewExtensions = new Set([
    '.svg',
    '.md',
    '.mdx',
    '.csv',
    '.adoc',
    '.tsv',
    '.ipynb',
    '.gltf'
  ])
  // Files that don't have to be decoded when sent to the FileRenderer
  // since they already display as text when the Editor is rendered
  static textExtensions = new Set([
    '.md',
    '.mdx',
    '.csv',
    '.tsv',
    '.ipynb',
    '.adoc'
  ])
  // Files that will always be displayed by the FileRenderer component.
  // This allows us to avoid unnecessarily decoding a file.
  static illegalExtensions = new Set([
    '.apng',
    '.avif',
    '.bmp',
    '.gif',
    '.png',
    '.webp',
    '.jpg',
    '.jpeg',
    '.jfif',
    '.pjpeg',
    '.pjp',
    '.ico',
    '.pdf',
    '.mp4',
    '.webm',
    '.mp3',
    '.wav',
    '.ogg',
    '.glb'
  ])

  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      isEncoding: false,
      decodedContent: null
    }

    this.encodeWorker = new Worker('../scripts/encode-decode-worker.js', {
      type: 'module'
    })

    this.editorRef = React.createRef()
    this.getTheme = this.getTheme.bind(this)
    this.initEditor = this.initEditor.bind(this)
    this.renderPreviewButton = this.renderPreviewButton.bind(this)
    this.viewZoneCallback = this.viewZoneCallback.bind(this)
    this.forceRenderPreview = this.forceRenderPreview.bind(this)
  }

  getTheme(colorScheme) {
    return colorScheme === 'theme-dark' ? 'vs-dark' : 'vs-light'
  }

  componentDidUpdate(prevProps) {
    const colorScheme = this.props.theme

    if (prevProps.theme !== colorScheme && this.monaco) {
      this.monaco.setTheme(this.getTheme(colorScheme))
    }
  }

  componentDidMount() {
    this.initEditor()
  }

  async initEditor() {
    this.setState({ isLoading: true })

    // monaco editor is loaded asynchronously to prevent unnecessarily
    // bundling all of the editor API when the project is built.
    const { editor: monaco, languages } = await import(
      'monaco-editor/esm/vs/editor/editor.api.js'
    )

    const languageOpts = {
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true
    }

    const { content, theme, language } = this.props

    // Disables lint warnings and syntax errors for languages
    languages.typescript.typescriptDefaults.setDiagnosticsOptions(languageOpts)
    languages.typescript.javascriptDefaults.setDiagnosticsOptions(languageOpts)
    languages.css.cssDefaults.setDiagnosticsOptions({
      validate: false
    })
    languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false
    })

    const model = monaco.createModel(content, language)

    this.editor = monaco.create(this.editorRef.current, {
      model,
      quickSuggestions: false,
      readOnly: true,
      minimap: {
        enabled: false
      },
      automaticLayout: true,
      fontSize: 14,
      theme: this.getTheme(theme),
      renderIndentGuides: false
    })

    // Gives the editor a small amount of space before the first line
    // to account for the size of the horizontal tab scrollbar
    this.editor.changeViewZones(this.viewZoneCallback)

    this.monaco = monaco
    this.setState({ isLoading: false })
  }

  viewZoneCallback(changeAccessor) {
    changeAccessor.addZone({
      afterLineNumber: 0,
      heightInPx: parseCSSVar('--scrollbar-height'),
      domNode: document.createElement('div')
    })
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.dispose()
    }
    this.encodeWorker.terminate()
  }

  renderPreviewButton() {
    if (
      !Editor.previewExtensions.has(this.props.extension) ||
      this.state.isLoading
    ) {
      return null
    }

    return (
      <button
        className="file-preview-btn"
        title="Preview file"
        onClick={this.forceRenderPreview}
      >
        <AiOutlineEye />
      </button>
    )
  }

  // Let the App component know that ths file should not
  // be rendered by the editor
  forceRenderPreview() {
    if (this.state.isEncoding) {
      return
    }
    const { content, onForceRender, extension } = this.props

    this.setState({
      isEncoding: true,
      isLoading: true
    })

    if (Editor.textExtensions.has(extension)) {
      onForceRender(content, false)
      return
    }

    this.encodeWorker.postMessage({
      message: content,
      type: 'encode'
    })

    this.encodeWorker.onmessage = event => {
      onForceRender(event.data, false)
    }

    this.encodeWorker.onerror = event => {
      Logger.error('Error encoding file', event.message)
      this.setState({
        isLoading: false,
        isEncoding: false
      })
    }
  }

  render() {
    return (
      <div className="monaco-editor-container" ref={this.editorRef}>
        {this.state.isLoading && (
          <LoadingOverlay
            text="Loading viewer..."
            className="editor-loading-overlay"
          />
        )}
        {this.renderPreviewButton()}
      </div>
    )
  }
}

Editor.propTypes = {
  extension: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  fileName: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  theme: PropTypes.oneOf(['theme-light', 'theme-dark']).isRequired,
  onForceRender: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(Editor)
