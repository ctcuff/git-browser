import '../../style/renderers/jupyter-renderer.scss'
import React from 'react'
import Logger from '../../scripts/logger'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'

type JupyterRendererProps = {
  /**
   * Not base64 encoded
   */
  content: string
}

type JupyterRendererState = {
  HTML: string
  isLoading: boolean
  hasError: boolean
  currentStep: string
}

class JupyterRenderer extends React.Component<
  JupyterRendererProps,
  JupyterRendererState
> {
  private nb!: typeof import('notebook')
  private MarkdownIt!: typeof import('markdown-it')
  private hljs!: typeof import('highlight.js')
  private Anser!: typeof import('anser')
  private DOMPurify!: typeof import('dompurify')

  constructor(props: JupyterRendererProps) {
    super(props)

    this.state = {
      HTML: '',
      isLoading: false,
      hasError: false,
      currentStep: 'Loading...'
    }

    this.init = this.init.bind(this)
    this.loadLibraries = this.loadLibraries.bind(this)
    this.parseNotebook = this.parseNotebook.bind(this)
    this.setCurrentStep = this.setCurrentStep.bind(this)
    this.highlighter = this.highlighter.bind(this)
    this.sanitizeNotebook = this.sanitizeNotebook.bind(this)
  }

  componentDidMount(): void {
    this.init()
  }

  setCurrentStep(currentStep: string): void {
    this.setState({ currentStep })
  }

  async init(): Promise<void> {
    this.setState({
      isLoading: true,
      hasError: false
    })

    try {
      this.setCurrentStep('Loading libraries...')
      await this.loadLibraries()

      this.setCurrentStep('Parsing notebook...')
      const HTML = this.parseNotebook(this.props.content)
      const sanitizedHTML = this.sanitizeNotebook(HTML)

      this.setState({
        HTML: sanitizedHTML,
        isLoading: false
      })
    } catch (err) {
      this.setState({
        isLoading: false,
        hasError: true
      })
    }
  }

  async loadLibraries(): Promise<void> {
    try {
      const [nb, MarkdownIt, hljs, anser, DOMPurify] = await Promise.all([
        import('../../lib/notebook'),
        import('markdown-it'),
        import('highlight.js'),
        import('anser'),
        import('dompurify')
      ])

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.nb = nb
      this.MarkdownIt = MarkdownIt.default
      this.hljs = hljs.default
      this.Anser = anser.default
      this.DOMPurify = DOMPurify.default
    } catch (err) {
      Logger.error(err)

      this.setState({
        isLoading: false,
        hasError: true
      })
    }
  }

  parseNotebook(content: string): string {
    const { nb, Anser, MarkdownIt } = this

    nb.ansi = text => Anser.ansiToText(text)

    nb.highlighter = (text, pre, code, lang) => {
      return this.highlighter(text, lang || 'python')
    }

    nb.markdown = str => {
      const md = new MarkdownIt({
        html: true,
        typographer: true,
        linkify: true,
        breaks: true,
        highlight: this.highlighter
      })

      return md.render(str)
    }

    try {
      const ipynb = JSON.parse(content)
      const notebook = nb.parse(ipynb)
      const HTMLString = notebook.render().outerHTML

      return HTMLString
    } catch (err) {
      Logger.error(err)
      throw err
    }
  }

  sanitizeNotebook(content: string): string {
    const { DOMPurify } = this

    DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
      // Opens all links in a new tab when clicked
      if (node.hasAttribute('target')) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    })

    return DOMPurify.sanitize(content, { RETURN_TRUSTED_TYPE: false })
  }

  highlighter(code: string, language: string): string {
    const { hljs } = this

    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value
      } catch (e) {
        Logger.warn(e)
      }
    }
    return ''
  }

  render(): JSX.Element {
    const { isLoading, hasError, currentStep, HTML } = this.state

    if (hasError) {
      return (
        <ErrorOverlay
          message="An error occurred while loading the preview."
          retryMessage="Retry"
          onRetryClick={this.init}
        />
      )
    }

    if (isLoading) {
      return <LoadingOverlay text={currentStep} />
    }

    return (
      <div className="jupyter-renderer">
        <div
          className="content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: HTML }}
        />
      </div>
    )
  }
}

export default JupyterRenderer
