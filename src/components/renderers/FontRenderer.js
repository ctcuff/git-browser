import '../../style/renderers/font-renderer.scss'
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

const FontRenderer = props => {
  // Need to replace new line characters to
  // get the font-family to load properly
  const content = props.content.replace(/[\r\n]/g, '')
  const mimeType = `font/${props.extension.slice(1)}`
  const fontFace = `
    @font-face {
      font-family: "FontRenderer-Preview";
      src: url("data:${mimeType};base64,${content}");
    }`

  useEffect(() => {
    const style = document.createElement('style')

    style.innerHTML = fontFace
    document.head.insertAdjacentElement('beforeend', style)

    // Remove this style when the component is unmounted
    return () => {
      style.remove()
    }
  }, [])

  return (
    <div className="font-renderer">
      <h1 className="text-preview">
        A shining crescent far beneath the flying vessel.
      </h1>
    </div>
  )
}

FontRenderer.propTypes = {
  content: PropTypes.string.isRequired,
  extension: PropTypes.oneOf(['.otf', '.ttf', '.woff', '.woff2'])
}

export default FontRenderer
