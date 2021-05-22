import '../../style/renderers/pdf-renderer.scss'
import React from 'react'
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/display/api'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'
import PDFPage from '../PDFPage'
import Logger from '../../scripts/logger'

type PDFRendererProps = {
  content: string
}

type PDFRendererState = {
  isLoading: boolean
  hasError: boolean
  currentStep: string
  // TODO: Check this
  pages: React.ReactElement<typeof PDFPage>[]
}

class PDFRenderer extends React.Component<PDFRendererProps, PDFRendererState> {
  private rawDecodeWorker: Worker
  private pdfjs!: typeof import('pdfjs-dist')

  constructor(props: PDFRendererProps) {
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

    this.rawDecodeWorker = new Worker(
      new URL('../../scripts/encode-decode.worker.ts', import.meta.url)
    )
  }

  componentDidMount(): void {
    this.init()
  }

  componentWillUnmount(): void {
    this.rawDecodeWorker.terminate()
  }

  setErrorState(): void {
    this.setState({
      isLoading: false,
      hasError: true
    })
  }

  decodeContent(): Promise<string> {
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

  loadPDF(decodedPdfData: string): void {
    this.pdfjs.getDocument({ data: decodedPdfData }).promise.then(
      (pdfDocument: PDFDocumentProxy) => {
        this.renderPages(pdfDocument)
      },
      err => {
        Logger.error('Error loading document', err)
        this.setErrorState()
      }
    )
  }

  async init(): Promise<void> {
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

  reload(): void {
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

  async renderPages(pdfDocument: PDFDocumentProxy): Promise<void> {
    const pages: React.ReactElement<typeof PDFPage>[] = []
    const promises: Promise<void>[] = []
    const { numPages } = pdfDocument

    for (let i = 0; i < numPages; i++) {
      const promise = pdfDocument.getPage(i + 1).then(
        (page: PDFPageProxy) => {
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

  render(): JSX.Element {
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

export default PDFRenderer
