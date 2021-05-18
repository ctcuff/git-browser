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
      base64ImageString: '',
      pngObjectUrl: ''
    }

    this.init = this.init.bind(this)
    this.convertPSD = this.convertPSD.bind(this)
    this.convertToUint8Array = this.convertToUint8Array.bind(this)

    this.rawDecodeWorker = new Worker('../../scripts/encode-decode.worker.js', {
      type: 'module'
    })
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    // Let the browser know that it no longer
    // needs to keep a reference to this file
    URL.revokeObjectURL(this.state.pngObjectUrl)
    this.rawDecodeWorker.terminate()
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
    // Need to convert the base 64 content string into a blob so that it can
    // be converted to a base 64 PNG string by PSD. Using fetch for the conversion
    // results in a large network request (sometimes more than 10 MB)
    // so we need to work with a byte array instead.
    const buffer = await this.convertToUint8Array(this.props.content)
    const blob = new Blob([buffer])
    const pngObjectUrl = URL.createObjectURL(blob)
    const psd = await this.PSD.fromURL(pngObjectUrl)

    this.setState({ pngObjectUrl })

    return psd.image.toBase64()
  }

  convertToUint8Array(content) {
    this.rawDecodeWorker.postMessage({
      message: content,
      type: 'convertToArrayBuffer'
    })

    return new Promise((resolve, reject) => {
      this.rawDecodeWorker.onmessage = event => resolve(event.data)
      this.rawDecodeWorker.onerror = () =>
        reject(new Error('Error decoding content'))
    })
  }

  render() {
    const { isLoading, hasError, base64ImageString, pngObjectUrl } = this.state
    const fileName = this.props.fileName.replace('.psd', '')

    if (isLoading) {
      return <LoadingOverlay text="Converting image to PNG..." />
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
          // This tag has the object URL as the href because the base 64 image
          // string can get large enough to freeze the browser when it's clicked
          href={pngObjectUrl}
          className="file-download-link"
          title="Download this file as a PNG"
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
