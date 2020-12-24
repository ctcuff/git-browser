import '../style/file-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import PDFRenderer from './renderers/PDFRenderer'
import ImageRenderer from './renderers/ImageRenderer'
import Editor from './Editor'
import { registerLanguage } from '../scripts/util'

class FileRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      forceRender: false
    }

    this.getComponent = this.getComponent.bind(this)
    this.renderUnsupported = this.renderUnsupported.bind(this)
    this.forceRenderEditor = this.forceRenderEditor.bind(this)
  }

  getComponent() {
    const { language, content, title, extension } = this.props

    switch (language) {
      case 'image':
        return (
          <ImageRenderer content={content} alt={title} extension={extension} />
        )
      case 'pdf':
        return <PDFRenderer content={content} />
      default:
        return this.renderUnsupported()
    }
  }

  renderUnsupported() {
    return (
      <div className="unsupported">
        <p>Unsupported file type.</p>
        <button className="reload-btn" onClick={this.forceRenderEditor}>
          Load anyway
        </button>
        <small className="warning-label">
          WARNING: This file type may or may not load correctly.
        </small>
      </div>
    )
  }

  forceRenderEditor() {
    // Register this language so that other editor tabs don't
    // have to keep displaying the unsupported language message
    registerLanguage(this.props.extension)
    this.setState({ forceRender: true })
  }

  render() {
    const { content, title, editorColorScheme } = this.props
    return this.state.forceRender ? (
      <Editor
        fileName={title}
        content={atob(content)}
        colorScheme={editorColorScheme}
      />
    ) : (
      <div className="file-renderer">{this.getComponent()}</div>
    )
  }
}

FileRenderer.propTypes = {
  language: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  extension: PropTypes.string.isRequired,
  editorColorScheme: PropTypes.string.isRequired
}

export default FileRenderer
