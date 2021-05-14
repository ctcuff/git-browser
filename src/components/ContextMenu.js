import '../style/context-menu.scss'
import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const preventDefault = event => event.preventDefault()

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

  const onOptionClick = option => {
    if (!option.disabled) {
      option.onClick()
    }
    props.onOptionClick()
  }

  useEffect(() => {
    if (isOpen) {
      let { x, y } = props.coords

      if (containerRef?.current) {
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
    <React.Fragment>
      <div
        className="context-menu-overlay"
        onMouseDown={props.onOverlayClick}
        onContextMenu={preventDefault}
      />
      <div
        className="context-menu"
        onContextMenu={preventDefault}
        ref={containerRef}
        style={{
          left: coords.x,
          top: coords.y,
          visibility: !hasAdjusted ? 'hidden' : 'visible'
        }}
      >
        <ul className="menu">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={onOptionClick.bind(this, option)}
              className={`menu-option ${option.disabled ? 'disabled' : ''}`}
            >
              {option.title}
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  )
}

ContextMenu.propTypes = {
  /**
   * A helper callback that makes it easier to close the
   * menu when any of the options are clicked
   */
  onOptionClick: PropTypes.func,
  onOverlayClick: PropTypes.func,
  isOpen: PropTypes.bool,
  coords: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool
    })
  ).isRequired
}

ContextMenu.defaultProps = {
  onOptionClick: () => {},
  onOverlayClick: () => {},
  isOpen: false
}

export default ContextMenu
