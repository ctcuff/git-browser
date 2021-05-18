import '../../style/base-modal.scss'
import React from 'react'
import ReactModal from 'react-modal'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { hideModal } from '../../store/actions/modal'

const BaseModal = props => (
  <ReactModal
    isOpen
    className={`modal ${props.className}`}
    overlayClassName="modal--overlay"
    onRequestClose={props.hideModal}
    shouldCloseOnOverlayClick
  >
    <div className="modal-content">
      {props.title && <h2 className="modal-title">{props.title}</h2>}
      <div className="modal-body">{props.children}</div>
      <div className="modal-actions">
        {props.actions.map(action => (
          <button
            className="action-btn"
            onClick={action.onClick}
            key={action.text}
            type="button"
          >
            {action.text}
          </button>
        ))}
        <button className="action-btn" onClick={props.hideModal} type="button">
          Close
        </button>
      </div>
    </div>
  </ReactModal>
)

const mapDispatchToProps = {
  hideModal
}

BaseModal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ]),
  hideModal: PropTypes.func.isRequired,
  className: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired
    })
  )
}

BaseModal.defaultProps = {
  title: '',
  actions: [],
  className: '',
  children: null
}

export default connect(null, mapDispatchToProps)(BaseModal)
