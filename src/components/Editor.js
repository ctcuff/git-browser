import '../style/editor.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { noop, parseCSSVar } from '../scripts/util'
import LoadingOverlay from './LoadingOverlay'
import { AiOutlineEye } from 'react-icons/ai'

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
    this.viewZoneCallback = this.viewZoneCallback.bind(this)
    this.forceRenderPreview = this.forceRenderPreview.bind(this)
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

    const { content, colorScheme, language } = this.props

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
      theme: this.getTheme(colorScheme),
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
    const validExtensions = ['.svg', '.md']

    if (
      !validExtensions.includes(this.props.extension) ||
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

  forceRenderPreview() {
    // Let the App component know that ths file should not
    // be rendered by the editor
    this.props.onForceRender(btoa(this.props.content), false)
  }

  render() {
    return (
      <div className="monaco-editor-container" ref={this.editorRef}>
        {this.state.isLoading && <LoadingOverlay text="Loading viewer..." />}
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
  colorScheme: PropTypes.string.isRequired,
  onForceRender: PropTypes.func
}

Editor.defaultProps = {
  onForceRender: noop
}

export default Editor
