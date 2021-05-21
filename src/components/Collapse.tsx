import '../style/collapse.scss'
import React, { useState, useEffect } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { withClasses } from '../scripts/util'

type CollapseProps = {
  open: boolean
  title: string
  children: React.ReactNode
  onToggle?: (isOpen: boolean) => void
  className?: string
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (props, ref) => {
    const [isOpen, setOpen] = useState(props.open)
    const openClass = withClasses({
      'is-open': isOpen,
      'is-closed': !isOpen
    })

    const toggle = () => {
      if (props.onToggle) {
        props.onToggle(!isOpen)
      }

      setOpen(!isOpen)
    }

    useEffect(() => {
      setOpen(props.open)
    }, [props.open])

    return (
      <div
        className={`collapse ${openClass} ${props.className || ''}`}
        ref={ref}
      >
        <button
          className="header"
          onClick={toggle}
          title={props.title}
          type="button"
        >
          <FiChevronRight className="toggle-icon" />
          <span className="collapse-title" title={props.title}>
            {props.title}
          </span>
        </button>
        <div className="content">{props.children}</div>
      </div>
    )
  }
)

Collapse.displayName = 'Collapse'

export default Collapse
