import '../style/editor.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { AiOutlineEye } from 'react-icons/ai'
import { connect } from 'react-redux'
import { parseCSSVar } from '../scripts/util'
import LoadingOverlay from './LoadingOverlay'
import Logger from '../scripts/logger'

class Editor extends React.Component {
  /**
   * File extensions that cause the component to
   * display the "preview file" button.
   */
  static previewExtensions = new Set([
    '.adoc',
    '.csv',
    '.gltf',
    '.ipynb',
    '.md',
    '.mdx',
    '.svg',
    '.tsv'
  ])

  /**
   * Files that don't have to be decoded when sent to the FileRenderer
   * since they already display as text when the Editor is rendered.
   * These files will still cause the preview button to be displayed.
   */
  static textExtensions = new Set([
    '.adoc',
    '.csv',
    '.ipynb',
    '.md',
    '.mdx',
    '.tsv'
  ])

  /**
   * Files that will always be displayed by the FileRenderer component.
   * This allows us to avoid unnecessarily decoding a file.
   */
  static illegalExtensions = new Set([
    '.aac',
    '.apng',
    '.avif',
    '.bmp',
    '.doc',
    '.docx',
    '.gif',
    '.glb',
    '.ico',
    '.jfif',
    '.jpeg',
    '.jpg',
    '.mp3',
    '.mp4',
    '.ogg',
    '.otf',
    '.pdf',
    '.pjp',
    '.pjpeg',
    '.png',
    '.ppt',
    '.pptx',
    '.psd',
    '.ttf',
    // .wasm is an exception. This file type will be decompiled and
    // displayed as text in an editor through the WasmRenderer component.
    '.wasm',
    '.wav',
    '.webm',
    '.webp',
    '.woff',
    '.woff2',
    '.zip'
  ])

  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      isEncoding: false
    }

    this.encodeWorker = new Worker('../scripts/encode-decode.worker.js', {
      type: 'module'
    })

    this.editorRef = React.createRef()
    this.getEditorTheme = this.getEditorTheme.bind(this)
    this.initEditor = this.initEditor.bind(this)
    this.renderPreviewButton = this.renderPreviewButton.bind(this)
    this.viewZoneCallback = this.viewZoneCallback.bind(this)
    this.forceRenderPreview = this.forceRenderPreview.bind(this)
  }

  componentDidMount() {
    this.initEditor()
  }

  componentDidUpdate(prevProps) {
    const { theme } = this.props
    const colorScheme =
      theme.userTheme === 'theme-auto' ? theme.preferredTheme : theme.userTheme

    if (prevProps.theme !== colorScheme) {
      this.monaco?.setTheme(this.getEditorTheme(colorScheme))
    }
  }

  componentWillUnmount() {
    this.editor?.dispose()
    this.encodeWorker.terminate()
  }

  getEditorTheme(colorScheme) {
    return colorScheme === 'theme-dark' ? 'vs-dark' : 'vs-light'
  }

  viewZoneCallback(changeAccessor) {
    changeAccessor.addZone({
      afterLineNumber: 0,
      heightInPx: parseCSSVar('--scrollbar-height'),
      domNode: document.createElement('div')
    })
  }

  async initEditor() {
    this.setState({ isLoading: true })

    // monaco editor is loaded asynchronously to prevent unnecessarily
    // bundling all of the editor API when the project is built.
    const { editor: monaco, languages } = await import(
      'monaco-editor/esm/vs/editor/editor.api'
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
    const editorTheme =
      theme.userTheme === 'theme-auto' ? theme.preferredTheme : theme.userTheme

    this.editor = monaco.create(this.editorRef.current, {
      model,
      quickSuggestions: false,
      readOnly: true,
      minimap: {
        enabled: false
      },
      automaticLayout: true,
      fontSize: 14,
      theme: this.getEditorTheme(editorTheme),
      renderIndentGuides: false
    })

    // Gives the editor a small amount of space before the first line
    // to account for the size of the horizontal tab scrollbar
    this.editor.changeViewZones(this.viewZoneCallback)

    this.monaco = monaco
    this.setState({ isLoading: false })
  }

  // Let the App component know that this file should not
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

    // This file can be displayed as text so it doesn't have to be decoded
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
        type="button"
      >
        <AiOutlineEye />
      </button>
    )
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
  content: PropTypes.string.isRequired,
  theme: PropTypes.shape({
    userTheme: PropTypes.oneOf(['theme-light', 'theme-dark', 'theme-auto'])
      .isRequired,
    preferredTheme: PropTypes.oneOf(['theme-light', 'theme-dark']).isRequired
  }).isRequired,
  onForceRender: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(Editor)
