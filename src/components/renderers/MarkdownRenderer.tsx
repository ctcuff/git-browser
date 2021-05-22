import '../../style/renderers/markdown-renderer.scss'
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import LoadingOverlay from '../LoadingOverlay'
import Logger from '../../scripts/logger'
import ErrorOverlay from '../ErrorOverlay'
import { State } from '../../store'

const mapStateToProps = (state: State) => ({
  theme: state.settings.theme
})

const connector = connect(mapStateToProps)

type MarkdownRendererProps = ConnectedProps<typeof connector> & {
  /**
   * Not base64 encoded
   */
  content: string
}

type MarkdownRendererState = {
  markdownContent: string
  isLoading: boolean
  hasError: boolean
  currentStep: string
}

class MarkdownRenderer extends React.Component<
  MarkdownRendererProps,
  MarkdownRendererState
> {
  private hljs!: typeof import('highlight.js')
  private DOMPurify!: typeof import('dompurify')
  private MarkdownIt!: typeof import('markdown-it')
  private mdPluginFrontMatter!: typeof import('markdown-it-front-matter')
  private mdPluginCheckbox!: typeof import('markdown-it-checkbox')
  private domConfig: import('dompurify').Config = {
    FORBID_TAGS: ['script', 'button'],
    FORBID_ATTR: ['style'],
    // Allows DOMPurify to return a string instead of TrustedHTML
    RETURN_TRUSTED_TYPE: false
  }

  constructor(props: MarkdownRendererProps) {
    super(props)

    this.state = {
      markdownContent: '',
      isLoading: false,
      hasError: false,
      currentStep: 'Loading...'
    }

    this.init = this.init.bind(this)
    this.importLibraries = this.importLibraries.bind(this)
    this.unsafeParseMarkdown = this.unsafeParseMarkdown.bind(this)
    this.sanitizeMarkdown = this.sanitizeMarkdown.bind(this)
    this.afterSanitizeElements = this.afterSanitizeElements.bind(this)
    this.afterSanitizeAttributes = this.afterSanitizeAttributes.bind(this)
    this.updateStep = this.updateStep.bind(this)
    this.highlighter = this.highlighter.bind(this)
  }

  componentDidMount(): void {
    this.init()
  }

  async init(): Promise<void> {
    this.setState({
      hasError: false,
      isLoading: true,
      currentStep: 'Loading libraries...'
    })

    try {
      await this.importLibraries()

      this.updateStep('Parsing markdown...')
      const rawMarkdown = this.unsafeParseMarkdown(this.props.content)

      this.updateStep('Sanitizing content...')
      const sanitized = this.sanitizeMarkdown(rawMarkdown)

      this.setState({
        isLoading: false,
        markdownContent: sanitized
      })
    } catch (err) {
      Logger.error(err)

      this.setState({
        hasError: true,
        isLoading: false
      })
    }
  }

  async importLibraries(): Promise<void> {
    try {
      const [
        hljs,
        DOMPurify,
        MarkdownIt,
        mdPluginCheckbox,
        mdPluginFrontMatter
      ] = await Promise.all([
        import('highlight.js'),
        import('dompurify'),
        import('markdown-it'),
        import('markdown-it-checkbox'),
        import('markdown-it-front-matter')
      ])

      this.hljs = hljs.default
      this.DOMPurify = DOMPurify.default
      this.MarkdownIt = MarkdownIt.default
      this.mdPluginCheckbox = mdPluginCheckbox.default
      this.mdPluginFrontMatter = mdPluginFrontMatter.default
    } catch (err) {
      Logger.error(err)
    }
  }

  updateStep(currentStep: string): void {
    this.setState({ currentStep })
  }

  afterSanitizeElements(node: Element): void {
    const { nodeName, parentNode, innerHTML } = node

    if (!parentNode) {
      return
    }

    // Only allow checkbox inputs to render
    if (
      nodeName === 'INPUT' &&
      (node as HTMLInputElement).type !== 'checkbox'
    ) {
      parentNode.removeChild(node)
    }

    // Rare case: replace <video> tags with the content inside of it as text
    if (nodeName === 'VIDEO') {
      const sanitized = this.DOMPurify.sanitize(innerHTML, this.domConfig)
      const textNode = document.createTextNode(sanitized as string)

      parentNode.removeChild(node)
      parentNode.appendChild(textNode)
    }
  }

  afterSanitizeAttributes(node: Element): void {
    // Opens all links in a new tab when clicked
    if (node.hasAttribute('target')) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  }

  unsafeParseMarkdown(rawMarkdown: string): string {
    const { MarkdownIt, mdPluginFrontMatter, mdPluginCheckbox } = this
    const md = new MarkdownIt({
      html: true,
      typographer: true,
      linkify: true,
      breaks: false,
      highlight: this.highlighter
    })

    md.use(mdPluginFrontMatter, () => {})
    md.use(mdPluginCheckbox, {
      divWrap: true,
      divClass: 'markdown-checkbox'
    })

    return md.render(rawMarkdown)
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

  sanitizeMarkdown(markdown: string): string {
    const { DOMPurify } = this

    DOMPurify.addHook('afterSanitizeElements', this.afterSanitizeElements)
    DOMPurify.addHook('afterSanitizeAttributes', this.afterSanitizeAttributes)

    return DOMPurify.sanitize(markdown, this.domConfig) as string
  }

  render() {
    const { isLoading, currentStep, markdownContent, hasError } = this.state

    if (hasError) {
      return (
        <ErrorOverlay
          message="Error loading preview."
          retryMessage="Retry"
          onRetryClick={this.init}
        />
      )
    }

    if (isLoading) {
      return <LoadingOverlay text={currentStep} />
    }

    if (!markdownContent?.trim()) {
      return <ErrorOverlay message="No content to display." showIcon={false} />
    }

    return (
      <div className="markdown-renderer">
        <div
          className="markdown-content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: markdownContent }}
        />
      </div>
    )
  }
}

const ConnectedMarkdownRenderer = connector(MarkdownRenderer)

export default ConnectedMarkdownRenderer
