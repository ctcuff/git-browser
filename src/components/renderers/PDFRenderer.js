import '../../style/pdf-renderer.scss'
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

// Note: pdfjs is used from react-pdf because it includes a web worker
// but the <Document /> and <Pages /> components aren't used because of
// a bug causing documents not to display after unmount and re-mount.
// https://github.com/wojtekmaj/react-pdf/issues/679
class PDFRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      hasError: false,
      decodedContent: null,
      pages: []
    }

    this.loadPDF = this.loadPDF.bind(this)
    this.reload = this.reload.bind(this)
    this.renderPages = this.renderPages.bind(this)
    this.decodeContent = this.decodeContent.bind(this)
    this.setErrorState = this.setErrorState.bind(this)

    this.rawDecodeWorker = new Worker('../../workers/raw-decode-worker.js', {
      type: 'module'
    })
  }

  componentDidMount() {
    // Dynamic import to reduce bundle size
    import('react-pdf/dist/esm/entry.webpack')
      .then(({ pdfjs }) => {
        this.pdfjs = pdfjs
        this.decodeContent()
      })
      .catch(err => {
        Logger.error(err)
        this.setErrorState()
      })
  }

  componentWillUnmount() {
    this.rawDecodeWorker.terminate()
  }

  decodeContent() {
    this.rawDecodeWorker.postMessage(this.props.content)
    this.rawDecodeWorker.onmessage = event => {
      this.setState({ decodedContent: event.data }, () => this.loadPDF())
    }

    this.rawDecodeWorker.onerror = event => {
      Logger.error('Error decoding PDF content', event)
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

    for (let i = 0; i < pdfDocument.numPages; i++) {
      await pdfDocument.getPage(i + 1).then(
        page => {
          pages.push(<PDFPage page={page} key={i} />)
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
        pages: []
      },
      () => this.decodeContent()
    )
  }

  render() {
    if (this.state.isLoading) {
      return <LoadingOverlay text="Loading PDF..." />
    }

    if (this.state.hasError) {
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
        <div className="page-count">
          <p> Total pages: {this.state.pages.length}</p>
        </div>
        <div className="pdf">{this.state.pages}</div>
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
