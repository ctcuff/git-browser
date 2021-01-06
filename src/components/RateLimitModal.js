import '../style/modal.scss'
import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import { connect } from 'react-redux'
import { hideModal } from '../store/actions/modal'
import PropTypes from 'prop-types'

ReactModal.setAppElement('#app')

const PreviewModal = props => {
  const [isOpen, setOpen] = useState(props.isOpen)

  useEffect(() => {
    setOpen(props.isOpen)
  }, [props.isOpen])

  return (
    <ReactModal
      className="modal"
      overlayClassName="modal--overlay"
      isOpen={isOpen}
      onRequestClose={props.hideModal}
      shouldCloseOnOverlayClick
    >
      <div className="modal-content">
        <h2 className="modal-title">Rate limit reached</h2>
        <p className="modal-body">
          {`Woah there, slow down! Looks like you've reached GitHub's rate limit.
          But there's good news: authenticated users get much higher rate limit!`}
        </p>
        <button className="close-btn" onClick={props.hideModal}>
          Close
        </button>
      </div>
    </ReactModal>
  )
}

const mapStateToProps = state => ({
  isOpen: state.modal.isOpen
})

const mapDispatchToProps = {
  hideModal
}

PreviewModal.propTypes = {
  isOpen: PropTypes.bool,
  hideModal: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(PreviewModal)
