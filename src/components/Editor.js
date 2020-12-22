import '../style/editor.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { editor as monacoEditor } from 'monaco-editor/esm/vs/editor/editor.api.js'
import { getLanguageFromFileName } from '../scripts/util'

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.editorRef = React.createRef()
    this.updateEditor = this.updateEditor.bind(this)
    this.getTheme = this.getTheme.bind(this)
  }

  getTheme(colorScheme) {
    return colorScheme === 'dark' ? 'vs-dark' : 'vs-light'
  }

  componentDidUpdate(prevProps) {
    const { colorScheme, content } = this.props

    if (prevProps.colorScheme !== colorScheme) {
      monacoEditor.setTheme(this.getTheme(colorScheme))
    }

    if (prevProps.content === content) {
      return
    }

    if (this.editor) {
      this.updateEditor()
    }
  }

  componentDidMount() {
    const { content, fileName } = this.props
    const model = monacoEditor.createModel(
      content,
      getLanguageFromFileName(fileName)
    )

    this.editor = monacoEditor.create(this.editorRef.current, {
      model,
      quickSuggestions: false,
      readOnly: true,
      minimap: {
        enabled: false
      },
      automaticLayout: true,
      fontSize: 14,
      theme: this.getTheme(this.props.colorScheme)
    })
  }

  componentWillUnmount() {
    this.editor.getModel().dispose()
    this.editor.dispose()
  }

  updateEditor() {
    const { fileName, content } = this.props
    const model = this.editor.getModel()

    model.setValue(content)
    monacoEditor.setModelLanguage(model, getLanguageFromFileName(fileName))
  }

  render() {
    return <div id="monaco-editor-container" ref={this.editorRef} />
  }
}

Editor.propTypes = {
  fileName: PropTypes.string,
  content: PropTypes.string,
  colorScheme: PropTypes.string
}

export default Editor
