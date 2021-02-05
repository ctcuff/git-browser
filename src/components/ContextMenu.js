import '../style/context-menu.scss'
import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const ContextMenu = props => {
  // Sometimes, repositioning the menu causes it to flicker then
  // jump to it's new position. To fix this, we need to hide the
  // menu and display it after its new position is calculated
  const [hasAdjusted, setAdjusted] = useState(false)
  const containerRef = useRef(null)
  const [coords, setCoords] = useState({
    x: props.coords.x,
    y: props.coords.y
  })
  const { isOpen, options } = props

  useEffect(() => {
    if (isOpen) {
      let { x, y } = props.coords

      if (containerRef && containerRef.current) {
        // If the menu is off the screen, set its position to 4px
        // away from the edge of the screen
        const menuWidth = containerRef.current.offsetWidth + 4
        const menuHeight = containerRef.current.offsetHeight + 4

        if (window.innerWidth - x < menuWidth) {
          x = window.innerWidth - menuWidth
        }

        if (window.innerHeight - y < menuHeight) {
          y = window.innerHeight - menuHeight
        }
      }

      setCoords({ x, y })
      setAdjusted(true)
    }

    return () => {
      setAdjusted(false)
    }
  }, [props.isOpen, props.coords])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="context-menu"
      onContextMenu={event => event.preventDefault()}
      ref={containerRef}
      style={{
        left: coords.x,
        top: coords.y,
        visibility: !hasAdjusted ? 'hidden' : 'visible'
      }}
    >
      <ul className="menu">
        {options.map((option, index) => (
          <li key={index} onClick={option.onClick} className="menu-option">
            {option.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

ContextMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  coords: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired
    })
  ).isRequired
}

export default ContextMenu
