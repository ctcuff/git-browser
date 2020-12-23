import '../style/editor.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { getLanguageFromFileName } from '../scripts/util'
import LoadingOverlay from './LoadingOverlay'

class Editor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false
    }

    this.editorRef = React.createRef()
    this.getTheme = this.getTheme.bind(this)
    this.initEditor = this.initEditor.bind(this)
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
      getLanguageFromFileName(this.props.fileName)
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

    this.monaco = monaco
    this.setState({ isLoading: false })
  }

  componentWillUnmount() {
    this.editor.getModel().dispose()
    this.editor.dispose()
  }

  render() {
    return (
      <div className="monaco-editor-container" ref={this.editorRef}>
        {this.state.isLoading && <LoadingOverlay text="Rendering..." />}
      </div>
    )
  }
}

Editor.propTypes = {
  fileName: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  colorScheme: PropTypes.string.isRequired
}

export default Editor
