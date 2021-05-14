import '../style/collapse.scss'
import React, { useState, useRef, useEffect } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import PropTypes from 'prop-types'
import { withClasses } from '../scripts/util'

const Collapse = React.forwardRef((props, ref) => {
  const [isOpen, setOpen] = useState(props.open)
  const contentRef = useRef(null)
  const openClass = withClasses({
    'is-open': isOpen,
    'is-closed': !isOpen
  })

  const toggle = () => {
    props.onToggle(!isOpen)
    setOpen(!isOpen)
  }

  useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  return (
    <div className={`collapse ${openClass} ${props.className}`} ref={ref}>
      <button className="header" onClick={toggle} title={props.title}>
        <FiChevronRight className="toggle-icon" />
        <span className="collapse-title" title={props.title}>
          {props.title}
        </span>
      </button>
      <div className="content" ref={contentRef}>
        {props.children}
      </div>
    </div>
  )
})

Collapse.displayName = 'Collapse'

Collapse.propTypes = {
  open: PropTypes.bool,
  onToggle: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string.isRequired
}

Collapse.defaultProps = {
  open: false,
  onToggle: () => {},
  className: '',
  children: null
}

export default Collapse
