import '../../style/renderers/ascii-doc-renderer.scss'
import React from 'react'
import ErrorOverlay from '../ErrorOverlay'
import LoadingOverlay from '../LoadingOverlay'
import Logger from '../../scripts/logger'

type AsciiDocRendererProps = {
  /**
   * Not base64 encoded
   */
  content: string
}

type AsciiDocRendererState = {
  isLoading: boolean
  hasError: boolean
  content: string
}

class AsciiDocRenderer extends React.Component<
  AsciiDocRendererProps,
  AsciiDocRendererState
> {
  private asciidoctor!: import('asciidoctor').Asciidoctor
  private DOMPurify!: import('dompurify').DOMPurifyI
  private hljs!: typeof import('highlight.js')

  constructor(props: AsciiDocRendererProps) {
    super(props)

    this.state = {
      isLoading: true,
      hasError: false,
      content: ''
    }

    this.init = this.init.bind(this)
    this.loadLibraries = this.loadLibraries.bind(this)
    this.parseAsciiDoc = this.parseAsciiDoc.bind(this)
    this.sanitizeAsciiDoc = this.sanitizeAsciiDoc.bind(this)
    this.afterSanitizeAttributes = this.afterSanitizeAttributes.bind(this)
    this.afterSanitizeElements = this.afterSanitizeElements.bind(this)
  }

  componentDidMount(): void {
    this.init()
  }

  async init(): Promise<void> {
    this.setState({
      hasError: false,
      isLoading: true
    })

    try {
      await this.loadLibraries()

      const unsafeContent = this.parseAsciiDoc(this.props.content)
      const content = this.sanitizeAsciiDoc(unsafeContent)

      this.setState({
        content,
        isLoading: false
      })
    } catch (err) {
      Logger.error(err)
      this.setState({
        hasError: true,
        isLoading: false
      })
    }
  }

  async loadLibraries(): Promise<void> {
    try {
      const [asciidoctor, DOMPurify, hljs] = await Promise.all([
        import('asciidoctor'),
        import('dompurify'),
        import('highlight.js')
      ])

      this.asciidoctor = asciidoctor.default()
      this.DOMPurify = DOMPurify.default
      this.hljs = hljs.default
    } catch (err) {
      Logger.error(err)
    }
  }

  parseAsciiDoc(content: string): string {
    return this.asciidoctor.convert(content, {
      attributes: {
        showTitle: true,
        standalone: false
      }
    }) as string
  }

  sanitizeAsciiDoc(content: string): string {
    const { DOMPurify } = this

    DOMPurify.addHook('afterSanitizeAttributes', this.afterSanitizeAttributes)
    DOMPurify.addHook('afterSanitizeElements', this.afterSanitizeElements)

    return DOMPurify.sanitize(content, {
      FORBID_TAGS: ['script', 'button', 'video'],
      FORBID_ATTR: ['style'],
      RETURN_TRUSTED_TYPE: false
    })
  }

  afterSanitizeAttributes(node: Element): void {
    // Opens all links in a new tab when clicked
    if (node.hasAttribute('target')) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  }

  afterSanitizeElements(node: Element): void {
    // asciidoctor doesn't automatically highlight code blocks so
    // we have to do it after sanitization. Only code blocks with a language
    // will be highlighted: <code data-lang="ruby">...</code>
    if (node.nodeName === 'CODE' && node.hasAttribute('data-lang')) {
      try {
        this.hljs.highlightBlock(node as HTMLElement)
      } catch (err) {
        Logger.warn(err)
      }
    }
  }

  render(): JSX.Element {
    const { isLoading, content, hasError } = this.state

    if (hasError) {
      return (
        <ErrorOverlay
          message="An error occurred while loading."
          retryMessage="Retry"
          onRetryClick={this.init}
        />
      )
    }

    if (isLoading) {
      return <LoadingOverlay text="Loading document..." />
    }

    if (!content.trim()) {
      return <ErrorOverlay message="No content to display." showIcon={false} />
    }

    return (
      <div className="ascii-doc-renderer">
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: content }}
          className="ascii-doc-content"
        />
      </div>
    )
  }
}

export default AsciiDocRenderer
