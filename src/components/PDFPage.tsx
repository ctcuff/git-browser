import React, { useCallback } from 'react'
import { PDFPageProxy } from 'pdfjs-dist/types/display/api'

type PDFPageProps = {
  page: PDFPageProxy
}

const PDFPage = ({ page }: PDFPageProps): JSX.Element => {
  const canvasRef = useCallback((canvasNode: HTMLCanvasElement | null) => {
    if (!canvasNode) {
      return
    }

    const viewport = page.getViewport({ scale: 3 })
    const context = canvasNode.getContext('2d')

    if (!context) {
      return
    }

    canvasNode.width = viewport.width
    canvasNode.height = viewport.height

    page.render({
      canvasContext: context,
      viewport
    })
  }, [])

  return <canvas ref={canvasRef} />
}

export default PDFPage
