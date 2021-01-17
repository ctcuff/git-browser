import '../../style/renderers/markdown-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import { noop } from '../../scripts/util'
import { connect } from 'react-redux'
import LoadingOverlay from '../LoadingOverlay'
import Logger from '../../scripts/logger'
import ErrorOverlay from '../ErrorOverlay'

class MarkdownRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      markdownContent: null,
      isLoading: false,
      hasError: false,
      currentStep: 'Loading...'
    }

    this.domConfig = {
      FORBID_TAGS: ['script', 'button'],
      FORBID_ATTR: ['style']
    }

    this.init = this.init.bind(this)
    this.importLibraries = this.importLibraries.bind(this)
    this.unsafeParseMarkdown = this.unsafeParseMarkdown.bind(this)
    this.sanitizeMarkdown = this.sanitizeMarkdown.bind(this)
    this.afterSanitizeElements = this.afterSanitizeElements.bind(this)
    this.afterSanitizeAttributes = this.afterSanitizeAttributes.bind(this)
    this.updateStep = this.updateStep.bind(this)
  }

  componentDidMount() {
    this.init()
  }

  async init() {
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

  async importLibraries() {
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

  updateStep(currentStep) {
    this.setState({ currentStep })
  }

  afterSanitizeElements(node) {
    const { nodeName, type, parentNode, innerHTML } = node

    if (!parentNode) {
      return
    }

    // Only allow checkbox inputs to render
    if (nodeName === 'INPUT' && type !== 'checkbox') {
      parentNode.removeChild(node)
    }

    // Rare case: replace <video> tags with the content inside of it as text
    if (nodeName === 'VIDEO') {
      const sanitized = this.DOMPurify.sanitize(innerHTML, this.domConfig)
      const textNode = document.createTextNode(sanitized)

      parentNode.removeChild(node)
      parentNode.appendChild(textNode)
    }
  }

  afterSanitizeAttributes(node) {
    // Opens all links in a new tab when clicked
    if ('target' in node) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  }

  unsafeParseMarkdown(rawMarkdown) {
    const { MarkdownIt, mdPluginFrontMatter, mdPluginCheckbox, hljs } = this
    const md = new MarkdownIt({
      html: true,
      typographer: true,
      linkify: true,
      breaks: false,
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value
          } catch (e) {
            Logger.warn(e)
          }
        }
        return ''
      }
    })

    md.use(mdPluginFrontMatter, noop)
    md.use(mdPluginCheckbox, {
      divWrap: true,
      divClass: 'markdown-checkbox'
    })

    return md.render(rawMarkdown)
  }

  sanitizeMarkdown(markdown) {
    const DOMPurify = this.DOMPurify

    DOMPurify.addHook('afterSanitizeElements', this.afterSanitizeElements)
    DOMPurify.addHook('afterSanitizeAttributes', this.afterSanitizeAttributes)

    return DOMPurify.sanitize(markdown, this.domConfig)
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

    return (
      <div className="markdown-renderer">
        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: markdownContent }}
        />
      </div>
    )
  }
}

MarkdownRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  theme: PropTypes.oneOf(['theme-dark', 'theme-light']).isRequired
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(MarkdownRenderer)
