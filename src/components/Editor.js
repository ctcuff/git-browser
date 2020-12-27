import '../style/editor.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { getLanguageFromFileName, parseCSSVar } from '../scripts/util'
import LoadingOverlay from './LoadingOverlay'
import { AiOutlineEye } from 'react-icons/ai'
import { connect } from 'react-redux'
import { showModal } from '../store/actions/modal'
import FileRenderer from './FileRenderer'

class Editor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false
    }

    this.editorRef = React.createRef()
    this.getTheme = this.getTheme.bind(this)
    this.initEditor = this.initEditor.bind(this)
    this.renderPreviewButton = this.renderPreviewButton.bind(this)
    this.showPreview = this.showPreview.bind(this)
    this.viewZoneCallback = this.viewZoneCallback.bind(this)
  }

  getTheme(colorScheme) {
    return colorScheme === 'dark' ? 'vs-dark' : 'vs-light'
  }

  componentDidUpdate(prevProps) {
    const colorScheme = this.props.colorScheme

    if (prevProps.colorScheme !== colorScheme) {
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

    // Disables lint warnings and syntax errors for languages
    languages.typescript.typescriptDefaults.setDiagnosticsOptions(languageOpts)
    languages.typescript.javascriptDefaults.setDiagnosticsOptions(languageOpts)
    languages.css.cssDefaults.setDiagnosticsOptions({
      validate: false
    })
    languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false
    })

    const model = monaco.createModel(
      this.props.content,
      getLanguageFromFileName(this.props.fileName).language
    )

    this.editor = monaco.create(this.editorRef.current, {
      model,
      quickSuggestions: false,
      readOnly: true,
      minimap: {
        enabled: false
      },
      automaticLayout: true,
      fontSize: 14,
      theme: this.getTheme(this.props.colorScheme),
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
    this.editor.getModel().dispose()
    this.editor.dispose()
  }

  renderPreviewButton() {
    const { extension } = getLanguageFromFileName(this.props.fileName)
    const validExtensions = ['.svg', '.md']

    if (!validExtensions.includes(extension) || this.state.isLoading) {
      return null
    }

    return (
      <button
        className="file-preview-btn"
        title="Preview file"
        onClick={this.showPreview.bind(this, extension)}
      >
        <AiOutlineEye />
      </button>
    )
  }

  showPreview(extension) {
    this.props.showPreviewModal(
      <FileRenderer
        extension={extension}
        title={this.props.fileName}
        content={btoa(this.props.content)}
        editorColorScheme={this.props.colorScheme}
      />
    )
  }

  render() {
    return (
      <div className="monaco-editor-container" ref={this.editorRef}>
        {this.state.isLoading && <LoadingOverlay text="Loading editor..." />}
        {this.renderPreviewButton()}
      </div>
    )
  }
}

Editor.propTypes = {
  fileName: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  colorScheme: PropTypes.string.isRequired,
  showPreviewModal: PropTypes.func
}

const mapDispatchToProps = {
  showPreviewModal: showModal
}

export default connect(null, mapDispatchToProps)(Editor)
