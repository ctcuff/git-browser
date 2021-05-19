import '../style/image-grid.scss'
import React, { useState, useEffect } from 'react'
import { GrGrid } from 'react-icons/gr'
import { connect } from 'react-redux'
import { SettingsState } from '../store/reducers/settings'
import { State } from '../store'

type ImageGridProps = Pick<SettingsState, 'theme'>

/**
 * Used to display a checkered background for images. This allows
 * the image to be seen a bit better if it contrasts with the background
 */
const ImageGrid = ({ theme }: ImageGridProps): JSX.Element => {
  const [gridClass, setGridClass] = useState('')
  const [showGrid, setShowGrid] = useState(false)

  const toggleGrid = () => setShowGrid(!showGrid)

  useEffect(() => {
    const { userTheme, preferredTheme } = theme

    // Need to set the theme of the background grid when the theme changes.
    // If the theme is auto, we'll use the user's preferred theme based on
    // their system settings.
    setGridClass(userTheme === 'theme-auto' ? preferredTheme : userTheme)
  }, [theme])

  return (
    <div className="image-grid">
      {showGrid && <div className={`grid ${gridClass}`} />}
      <button className="grid-toggle" onClick={toggleGrid} type="button">
        <GrGrid title="Toggle background" />
      </button>
    </div>
  )
}

const mapStateToProps = (state: State) => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(ImageGrid)
