import '../style/image-grid.scss'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { GrGrid } from 'react-icons/gr'
import { connect } from 'react-redux'

const ImageGrid = ({ theme }) => {
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

ImageGrid.propTypes = {
  theme: PropTypes.shape({
    userTheme: PropTypes.oneOf(['theme-dark', 'theme-light', 'theme-auto'])
      .isRequired,
    preferredTheme: PropTypes.oneOf(['theme-dark', 'theme-light']).isRequired
  }).isRequired
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(ImageGrid)
