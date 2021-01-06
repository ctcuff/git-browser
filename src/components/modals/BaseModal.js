import '../../style/base-modal.scss'
import React from 'react'
import ReactModal from 'react-modal'
import { connect } from 'react-redux'
import { hideModal } from '../../store/actions/modal'
import PropTypes from 'prop-types'

const BaseModal = props => (
  <ReactModal
    isOpen
    className={`modal ${props.className}`}
    overlayClassName="modal--overlay"
    onRequestClose={props.hideModal}
    shouldCloseOnOverlayClick
  >
    <div className="modal-content">
      <h2 className="modal-title">{props.title}</h2>
      <div className="modal-body">{props.children}</div>
      <button className="close-btn" onClick={props.hideModal}>
        Close
      </button>
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
  className: PropTypes.string
}

export default connect(null, mapDispatchToProps)(BaseModal)
