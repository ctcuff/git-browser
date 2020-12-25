import '../style/file-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import PDFRenderer from './renderers/PDFRenderer'
import ImageRenderer from './renderers/ImageRenderer'

class FileRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false
    }

    this.getComponent = this.getComponent.bind(this)
  }

  getComponent() {
    const { fileType, content, title } = this.props

    switch (fileType) {
      case 'image':
        return <ImageRenderer content={content} alt={title} />
      case 'pdf':
        return <PDFRenderer content={content} />
      default:
        return (
          <div className="unsupported">
            <p>Unsupported file type.</p>
          </div>
        )
    }
  }

  render() {
    return <div className="file-renderer">{this.getComponent()}</div>
  }
}

FileRenderer.propTypes = {
  fileType: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  extension: PropTypes.string.isRequired
}

export default FileRenderer
