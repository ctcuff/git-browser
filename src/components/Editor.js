import '../style/editor.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { editor as monacoEditor } from 'monaco-editor'
import { getLanguageFromFileName } from '../scripts/util'

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.editorRef = React.createRef()
    this.updateEditor = this.updateEditor.bind(this)
  }

  componentDidUpdate(prevProps) {
    const { colorScheme, content } = this.props

    if (prevProps.colorScheme !== colorScheme) {
      monacoEditor.setTheme(colorScheme === 'dark' ? 'vs-dark' : 'vs-light')
    }

    if (prevProps.content === content) {
      console.log('No Update')
      return
    }

    if (this.editor) {
      this.updateEditor()
    }

    console.log('update')
  }

  componentDidMount() {
    const { content, fileName } = this.props
    const model = monacoEditor.createModel(
      content,
      getLanguageFromFileName(fileName)
    )

    this.editor = monacoEditor.create(this.editorRef.current, {
      model,
      readOnly: true,
      minimap: {
        enabled: false
      },
      automaticLayout: true,
      fontSize: 14,
      theme: this.props.colorScheme === 'dark' ? 'vs-dark' : 'vs-light'
    })

    // Gives the editor a small amount of space before the first line
    this.editor.changeViewZones(changeAccessor => {
      changeAccessor.addZone({
        afterLineNumber: 0,
        heightInPx: 4,
        domNode: document.createElement('div')
      })
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
