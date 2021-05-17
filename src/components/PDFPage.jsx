import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

const PDFPage = ({ page }) => {
  const canvasRef = useCallback(canvasNode => {
    if (!canvasNode) {
      return
    }

    const viewport = page.getViewport({ scale: 3 })
    const context = canvasNode.getContext('2d')

    canvasNode.width = viewport.width
    canvasNode.height = viewport.height

    page.render({
      canvasContext: context,
      viewport
    })
  }, [])

  return <canvas ref={canvasRef} />
}

PDFPage.propTypes = {
  // Disabled since pdf.js is loaded asynchronously so
  // we won't be able to validate this prop until the component
  // is rendered
  // eslint-disable-next-line react/forbid-prop-types
  page: PropTypes.object.isRequired
}

export default PDFPage
