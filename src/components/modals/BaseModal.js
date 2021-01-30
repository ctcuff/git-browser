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
      {props.title && <h2 className="modal-title">{props.title}</h2>}
      <div className="modal-body">{props.children}</div>
      <div className="modal-actions">
        <React.Fragment>
          {props.actions.map((action, index) => (
            <button className="action-btn" onClick={action.onClick} key={index}>
              {action.text}
            </button>
          ))}
        </React.Fragment>
        <button className="action-btn" onClick={props.hideModal}>
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
  actions: [],
  className: ''
}

export default connect(null, mapDispatchToProps)(BaseModal)
