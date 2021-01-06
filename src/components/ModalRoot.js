import React from 'react'
import RateLimitModal from './modals/RateLimitModal'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ReactModal from 'react-modal'

ReactModal.setAppElement('#app')

const ModalTypes = {
  RATE_LIMIT: 'RATE_LIMIT'
}

const ModalComponents = {
  RATE_LIMIT: RateLimitModal
}

// Handles orchestrating what modals should be shown depending on what
// modal type is dispatched in the modal store
const ModalRoot = ({ isOpen, modalType }) => {
  if (!isOpen || !modalType || !ModalComponents[modalType]) {
    return null
  }

  const Modal = ModalComponents[modalType]

  return <Modal />
}

const mapStateToProps = state => ({
  isOpen: state.modal.isOpen,
  modalType: state.modal.modalType
})

ModalRoot.propTypes = {
  modalType: PropTypes.oneOf(Object.keys(ModalComponents)),
  isOpen: PropTypes.bool
}

export { ModalTypes }
export default connect(mapStateToProps)(ModalRoot)
