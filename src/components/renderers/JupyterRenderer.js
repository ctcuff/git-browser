import '../../style/renderers/jupyter-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import Logger from '../../scripts/logger'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'

class JupyterRenderer extends React.Component {
  constructor(props) {
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

  componentDidMount() {
    this.init()
  }

  async init() {
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

  setCurrentStep(currentStep) {
    this.setState({ currentStep })
  }

  async loadLibraries() {
    try {
      const [nb, MarkdownIt, hljs, anser, DOMPurify] = await Promise.all([
        import('../../lib/notebook'),
        import('markdown-it'),
        import('highlight.js'),
        import('anser'),
        import('dompurify')
      ])

      this.nb = nb.default
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

  parseNotebook(content) {
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

  sanitizeNotebook(content) {
    const DOMPurify = this.DOMPurify

    DOMPurify.addHook('afterSanitizeAttributes', node => {
      // Opens all links in a new tab when clicked
      if ('target' in node) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    })

    return DOMPurify.sanitize(content)
  }

  highlighter(str, lang) {
    const hljs = this.hljs

    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (e) {
        Logger.warn(e)
      }
    }
    return ''
  }

  render() {
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
        <div className="content" dangerouslySetInnerHTML={{ __html: HTML }} />
      </div>
    )
  }
}

JupyterRenderer.propTypes = {
  content: PropTypes.string.isRequired
}

export default JupyterRenderer
