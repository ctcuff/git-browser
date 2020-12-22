/* eslint-disable no-unused-vars */
import '../style/editor.scss'
import 'codemirror/lib/codemirror.css'
import '../style/github-theme.scss'
import 'codemirror/addon/scroll/simplescrollbars'
import React from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
// import { UnControlled as CodeMirror } from 'react-codemirror2'
import { getLanguageFromFileName } from '../scripts/util'

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.editorRef = React.createRef()
    this.updateEditor = this.updateEditor.bind(this)
    this.getTheme = this.getTheme.bind(this)
    this.initEditor = this.initEditor.bind(this)
  }

  getTheme(colorScheme) {
    return colorScheme === 'dark' ? 'vs-dark' : 'vs-light'
  }

  componentDidUpdate(prevProps) {
    const { content } = this.props

    // if (prevProps.colorScheme !== colorScheme) {
    //   monacoEditor.setTheme(this.getTheme(colorScheme))
    // }

    if (prevProps.content === content) {
      return
    }

    if (this.editor) {
      this.updateEditor()
    }
  }

  componentDidMount() {
    this.initEditor()
  }

  async initEditor() {
    const { content, fileName } = this.props
    let language = getLanguageFromFileName(fileName)

    console.log({ language })

    try {
      await import(`codemirror/mode/${language}/${language}`)
    } catch (e) {
      console.warn(e)
      language = ''
    }

    this.editor = CodeMirror(this.editorRef.current, {
      value: content,
      mode: language,
      lineNumbers: true,
      readOnly: true,
      cursorBlinkRate: 0,
      fixedGutter: false,
      theme: 'github',
      scrollbarStyle: 'overlay'
    })
  }

  componentWillUnmount() {}

  updateEditor() {
    // const { fileName, content } = this.props
    // this.editor.refresh()
  }

  render() {
    // return (
    //   <CodeMirror
    //     className="editor"
    //     value={this.props.content}
    //     ref={this.editorRef}
    //     options={{
    //       mode: 'javascript',
    //       theme: 'default',
    //       lineNumbers: true,
    //       readOnly: true,
    //       cursorBlinkRate: 0
    //     }}
    //   />
    // )
    return <div className="editor" ref={this.editorRef}></div>
  }
}

Editor.propTypes = {
  fileName: PropTypes.string,
  content: PropTypes.string,
  colorScheme: PropTypes.string
}

export default Editor
