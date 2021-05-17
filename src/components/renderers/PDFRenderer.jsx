import '../../style/renderers/pdf-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import PDFPage from '../PDFPage'
import Logger from '../../scripts/logger'

class PDFRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      hasError: false,
      currentStep: 'Loading PDF...',
      pages: []
    }

    this.init = this.init.bind(this)
    this.loadPDF = this.loadPDF.bind(this)
    this.reload = this.reload.bind(this)
    this.renderPages = this.renderPages.bind(this)
    this.decodeContent = this.decodeContent.bind(this)
    this.setErrorState = this.setErrorState.bind(this)

    this.rawDecodeWorker = new Worker('../../scripts/encode-decode-worker.js', {
      type: 'module'
    })
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.rawDecodeWorker.terminate()
  }

  setErrorState() {
    this.setState({
      isLoading: false,
      hasError: true
    })
  }

  decodeContent() {
    return new Promise((resolve, reject) => {
      this.rawDecodeWorker.postMessage({
        message: this.props.content,
        type: 'decode',
        raw: true
      })

      this.rawDecodeWorker.onmessage = event => {
        resolve(event.data)
      }

      this.rawDecodeWorker.onerror = event => {
        reject(new Error(event.message))
      }
    })
  }

  loadPDF(decodedPdfData) {
    this.pdfjs.getDocument({ data: decodedPdfData }).promise.then(
      pdfDocument => {
        this.renderPages(pdfDocument)
      },
      err => {
        Logger.error('Error loading document', err)
        this.setErrorState()
      }
    )
  }

  async init() {
    try {
      this.pdfjs = await import('pdfjs-dist')
      this.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${this.pdfjs.version}/pdf.worker.js`

      const decodedData = await this.decodeContent()

      this.loadPDF(decodedData)
    } catch (err) {
      Logger.error(err)
      this.setErrorState()
    }
  }

  reload() {
    this.setState(
      {
        isLoading: true,
        hasError: false,
        pages: [],
        currentStep: 'Loading PDF...'
      },
      this.init
    )
  }

  async renderPages(pdfDocument) {
    const pages = []
    const promises = []
    const { numPages } = pdfDocument

    for (let i = 0; i < numPages; i++) {
      const promise = pdfDocument.getPage(i + 1).then(
        page => {
          pages.push(<PDFPage page={page} key={i} />)
          this.setState({
            currentStep: `Loading page ${i + 1}/${numPages}`
          })
        },
        err => {
          Logger.error(`Error loading page at index ${i}`, err)
          this.setErrorState()
        }
      )

      promises.push(promise)
    }

    await Promise.all(promises)

    this.setState({
      isLoading: false,
      pages
    })
  }

  render() {
    const { currentStep, isLoading, hasError, pages } = this.state

    if (isLoading) {
      return <LoadingOverlay text={currentStep} />
    }

    if (hasError) {
      return (
        <ErrorOverlay
          message="Error loading PDF"
          retryMessage="Retry"
          onRetryClick={this.reload}
        />
      )
    }

    return (
      <div className="pdf-renderer">
        <div className="pdf">{pages}</div>
        <div className="page-count">
          <p> Total pages: {pages.length}</p>
        </div>
      </div>
    )
  }
}

PDFRenderer.propTypes = {
  content: PropTypes.string.isRequired
}

export default PDFRenderer
