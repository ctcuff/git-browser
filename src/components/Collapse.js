import '../style/collapse.scss'
import React, { useState, useRef, useEffect } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import PropTypes from 'prop-types'

const Collapse = props => {
  const [isOpen, setOpen] = useState(props.open)
  const contentRef = useRef(null)
  const openClass = `is-${isOpen ? 'open' : 'closed'}`

  // Need to re render this component if the open prop changes
  useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  return (
    <div className={`collapse ${openClass}`}>
      <button className="header" onClick={() => setOpen(!isOpen)}>
        <FiChevronRight className="toggle-icon" />
        <span>{props.title}</span>
      </button>
      <div className="content-wrapper">
        <div className="content" ref={contentRef}>
          {props.children}
        </div>
      </div>
    </div>
  )
}

Collapse.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool
}

Collapse.defaultProps = {
  open: false
}

export default Collapse
