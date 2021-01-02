import '../../style/markdown-renderer.scss'
import React, { useEffect } from 'react'
import MarkdownIt from 'markdown-it'
import markdownPluginCheckbox from 'markdown-it-checkbox'
import markdownPluginFrontMatter from 'markdown-it-front-matter'
import PropTypes from 'prop-types'
import hljs from 'highlight.js'
import { noop } from '../../scripts/util'
import DOMPurify from 'dompurify'
import { connect } from 'react-redux'

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
        // Ignored
      }
    }
    return ''
  }
})

const domConfig = {
  FORBID_TAGS: ['script', 'button'],
  FORBID_ATTR: ['style']
}

md.use(markdownPluginFrontMatter, noop)
md.use(markdownPluginCheckbox, {
  divWrap: true,
  divClass: 'markdown-checkbox'
})

DOMPurify.addHook('afterSanitizeElements', node => {
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
    const sanitized = DOMPurify.sanitize(innerHTML, domConfig)
    const textNode = document.createTextNode(sanitized)

    parentNode.removeChild(node)
    parentNode.appendChild(textNode)
  }
})

DOMPurify.addHook('afterSanitizeAttributes', node => {
  // Opens all links in a new tab when clicked
  if ('target' in node) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

const lightStyle = document.querySelector('link[title="theme-light"]')
const darkStyle = document.querySelector('link[title="theme-dark"]')

const MarkdownRenderer = props => {
  const unsafe = md.render(props.content)
  const sanitized = DOMPurify.sanitize(unsafe, domConfig)

  useEffect(() => {
    if (props.theme === 'theme-dark') {
      lightStyle.setAttribute('disabled', 'disabled')
      darkStyle.removeAttribute('disabled')
    } else {
      darkStyle.setAttribute('disabled', 'disabled')
      lightStyle.removeAttribute('disabled')
    }
  }, [props.theme])

  return (
    <div className="markdown-renderer">
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </div>
  )
}

MarkdownRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  theme: PropTypes.oneOf(['theme-dark', 'theme-light']).isRequired
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(MarkdownRenderer)
