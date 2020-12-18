import '../style/collapse.scss'
import React, { useState, useRef, useEffect } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import PropTypes from 'prop-types'
import { noop } from '../scripts/util'

const Collapse = props => {
  const [isOpen, setOpen] = useState(props.open)
  const contentRef = useRef(null)
  const openClass = `is-${isOpen ? 'open' : 'closed'}`

  const toggle = () => {
    props.onToggle(!isOpen)
    setOpen(!isOpen)
  }

  // Need to re render this component if the open prop changes
  useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  return (
    <div className={`collapse ${openClass}`}>
      <button className="header" onClick={toggle}>
        <FiChevronRight className="toggle-icon" />
        <span>{props.title}</span>
      </button>
      <div className="content" ref={contentRef}>
        {props.children}
      </div>
    </div>
  )
}

Collapse.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool,
  onToggle: PropTypes.func
}

Collapse.defaultProps = {
  open: false,
  onToggle: noop
}

export default Collapse
