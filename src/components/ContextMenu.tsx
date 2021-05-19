import '../style/context-menu.scss'
import React, { useRef, useEffect, useState } from 'react'

type ContextMenuProps = {
  /**
   * A helper callback that makes it easier to close the
   * menu when any of the options are clicked
   */
  onOptionClick: () => void
  onOverlayClick: () => void
  coords: {
    x: number
    y: number
  }
  isOpen: boolean
  options: MenuOption[]
}

const preventDefault = (event: React.MouseEvent) => event.preventDefault()

const ContextMenu = (props: ContextMenuProps): JSX.Element | null => {
  // Sometimes, repositioning the menu causes it to flicker then
  // jump to it's new position. To fix this, we need to hide the
  // menu and display it after its new position is calculated
  const [hasAdjusted, setAdjusted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({
    x: props.coords.x,
    y: props.coords.y
  })
  const { isOpen, options } = props

  const onOptionClick = (option: MenuOption) => {
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
    <>
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
          {options.map(option => (
            <li
              key={option.title}
              onClick={() => onOptionClick(option)}
              className={`menu-option ${option.disabled ? 'disabled' : ''}`}
            >
              {option.title}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default ContextMenu
export type MenuOption = {
  title: string
  onClick: () => void
  disabled?: boolean
}
