import '../../style/markdown-renderer.scss'
import 'highlight.js/styles/stackoverflow-light.css'
import React from 'react'
import MarkdownIt from 'markdown-it'
import markdownPluginCheckbox from 'markdown-it-checkbox'
import markdownPluginFrontMatter from 'markdown-it-front-matter'
import PropTypes from 'prop-types'
import hljs from 'highlight.js'
import { noop } from '../../scripts/util'
import DOMPurify from 'dompurify'

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

// Opens all links in a new tab when clicked
md.renderer.rules.link_open = (tokens, index, options, env, self) => {
  tokens[index].attrPush(['target', '_blank'])
  tokens[index].attrPush(['rel', 'noopener noreferrer'])
  return self.renderToken(tokens, index, options, env, self)
}

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

const MarkdownRenderer = props => {
  const unsafe = md.render(props.content)
  const sanitized = DOMPurify.sanitize(unsafe, domConfig)

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
  content: PropTypes.string.isRequired
}

export default MarkdownRenderer
