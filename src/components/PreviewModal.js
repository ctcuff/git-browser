import '../style/modal.scss'
import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import { connect } from 'react-redux'
import { hideModal } from '../store/actions/modal'
import PropTypes from 'prop-types'

ReactModal.setAppElement('#app')

const PreviewModal = props => {
  const [isOpen, setOpen] = useState(props.isOpen)

  useEffect(() => setOpen(props.isOpen), [props.isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <ReactModal
      className="modal"
      overlayClassName="modal--overlay"
      isOpen={isOpen}
      onRequestClose={props.hideModal}
      shouldCloseOnOverlayClick
    >
      <button className="close-btn" onClick={props.hideModal}>
        &times;
      </button>
      <div className="modal-content">{props.body}</div>
    </ReactModal>
  )
}

const mapStateToProps = state => ({
  isOpen: state.modal.isOpen,
  body: state.modal.body
})

const mapDispatchToProps = {
  hideModal
}

PreviewModal.propTypes = {
  isOpen: PropTypes.bool,
  hideModal: PropTypes.func,
  body: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)])
}

export default connect(mapStateToProps, mapDispatchToProps)(PreviewModal)
