/* eslint-disable no-unused-vars */
import '../style/editor.scss'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/lib/codemirror.css'
import '../style/github-theme.scss'
import 'codemirror/addon/scroll/simplescrollbars'
import React from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
// import { UnControlled as CodeMirror } from 'react-codemirror2'
import { getLanguageFromFileName } from '../scripts/util'
import { noop } from '../scripts/util'
import LoadingOverlay from './LoadingOverlay'
import { AiOutlineEye } from 'react-icons/ai'
import FileRenderer from './FileRenderer'
import Logger from '../scripts/logger'

class Editor extends React.Component {
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
    this.forceRenderPreview = this.forceRenderPreview.bind(this)
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

    Logger.info({ language })

    try {
      await import(`codemirror/mode/${language}/${language}`)
    } catch (e) {
      Logger.warn(e)
      language = ''
    }

    this.editor = CodeMirror(this.editorRef.current, {
      value: content,
      mode: language,
      lineNumbers: true,
      readOnly: true,
      cursorBlinkRate: 0,
      fixedGutter: true,
      theme: 'github',
      scrollbarStyle: 'overlay'
    })

    this.setState({ isLoading: false })
  }

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
    return (
      <div className="editor" ref={this.editorRef}>
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

  renderPreviewButton() {
    if (
      !FileRenderer.validEditorExtensions.includes(this.props.extension) ||
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
    const { content, onForceRender } = this.props

    this.setState({
      isEncoding: true,
      isLoading: true
    })

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
