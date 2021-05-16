import '../../style/renderers/psd-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { AiOutlineSave } from 'react-icons/ai'
import Logger from '../../scripts/logger'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import ImageGrid from '../ImageGrid'

class PSDRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      hasError: false,
      base64ImageString: ''
    }

    this.init = this.init.bind(this)
    this.convertPSD = this.convertPSD.bind(this)
  }

  componentDidMount() {
    this.init()
  }

  async init() {
    this.setState({
      isLoading: true,
      hasError: false
    })

    try {
      this.PSD = await import('psd.js')

      const imageData = await this.convertPSD()

      this.setState({
        isLoading: false,
        hasError: false,
        base64ImageString: imageData
      })
    } catch (err) {
      Logger.error(err)

      this.setState({
        isLoading: false,
        hasError: true
      })
    }
  }

  async convertPSD() {
    const url = `data:image/png;base64,${this.props.content}`
    const resp = await fetch(url)
    const blob = await resp.blob()
    const objectUrl = URL.createObjectURL(blob)

    const psd = await this.PSD.fromURL(objectUrl)

    URL.revokeObjectURL(objectUrl)

    return psd.image.toBase64()
  }

  render() {
    const { isLoading, hasError, base64ImageString } = this.state
    const fileName = this.props.fileName.replace('.psd', '')

    if (isLoading) {
      return <LoadingOverlay text="Loading image..." />
    }

    if (hasError) {
      return (
        <ErrorOverlay
          message="An error occurred while loading this image."
          retryMessage="Retry"
          onRetryClick={this.init}
        />
      )
    }

    return (
      <div className="psd-renderer">
        <ImageGrid />
        <a
          href={base64ImageString}
          className="file-download-link"
          title="Download as a PNG"
          download={`${fileName}.png`}
        >
          <AiOutlineSave />
        </a>
        <img
          src={base64ImageString}
          alt={`${fileName} Rendered from photoshop`}
        />
      </div>
    )
  }
}

PSDRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  fileName: PropTypes.string.isRequired
}

export default PSDRenderer
