import '../../style/renderers/pdf-renderer.scss'
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import Logger from '../../scripts/logger'

const PDFPage = props => {
  const canvasRef = useRef(null)
  const page = props.page

  useEffect(() => {
    const canvas = canvasRef.current
    const viewport = page.getViewport({ scale: 3 })
    const context = canvas.getContext('2d')

    canvas.width = viewport.width
    canvas.height = viewport.height

    page.render({
      canvasContext: context,
      viewport
    })
  }, [])

  return <canvas ref={canvasRef} />
}

class PDFRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      hasError: false,
      decodedContent: null,
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

  init() {
    // Dynamic import to reduce bundle size
    import('pdfjs-dist')
      .then(pdfjs => {
        this.pdfjs = pdfjs
        this.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
        this.decodeContent()
      })
      .catch(err => {
        Logger.error(err)
        this.setErrorState()
      })
  }

  decodeContent() {
    this.rawDecodeWorker.postMessage({
      message: this.props.content,
      type: 'decode',
      raw: true
    })

    this.rawDecodeWorker.onmessage = event => {
      this.setState({ decodedContent: event.data }, () => this.loadPDF())
    }

    this.rawDecodeWorker.onerror = event => {
      Logger.error('Error decoding PDF content', event.message)
      this.setErrorState()
    }
  }

  loadPDF() {
    const data = this.state.decodedContent

    this.pdfjs.getDocument({ data }).promise.then(
      pdfDocument => {
        this.renderPages(pdfDocument)
      },
      err => {
        Logger.error('Error loading document', err)
        this.setErrorState()
      }
    )
  }

  async renderPages(pdfDocument) {
    const pages = []
    const numPages = pdfDocument.numPages

    for (let i = 0; i < numPages; i++) {
      await pdfDocument.getPage(i + 1).then(
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
    }

    this.setState({
      isLoading: false,
      pages
    })
  }

  setErrorState() {
    this.setState({
      isLoading: false,
      hasError: true
    })
  }

  reload() {
    this.setState(
      {
        isLoading: true,
        hasError: false,
        pages: [],
        currentStep: 'Loading PDF...'
      },
      () => this.init()
    )
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

PDFPage.propTypes = {
  page: PropTypes.object
}

PDFRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  onLoadFinished: PropTypes.func
}

export default PDFRenderer
