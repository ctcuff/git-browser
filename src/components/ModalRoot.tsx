import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import ReactModal from 'react-modal'
import RateLimitModal from './modals/RateLimitModal'
import AuthErrorModal from './modals/AuthErrorModal'
import FullAccessModal from './modals/FullAccessModal'
import FileDownloadErrorModal from './modals/FileDownloadErrorModal'
import { State } from '../store'

ReactModal.setAppElement('#app')

const ModalTypes = {
  RATE_LIMIT: 'RATE_LIMIT',
  AUTH_ERROR: 'AUTH_ERROR',
  FULL_ACCESS: 'FULL_ACCESS',
  FILE_DOWNLOAD_ERROR: 'FILE_DOWNLOAD_ERROR'
}

const ModalComponents: { [key: string]: React.ElementType } = {
  RATE_LIMIT: RateLimitModal,
  AUTH_ERROR: AuthErrorModal,
  FULL_ACCESS: FullAccessModal,
  FILE_DOWNLOAD_ERROR: FileDownloadErrorModal
}

const mapStateToProps = (state: State) => ({
  isOpen: state.modal.isOpen,
  modalType: state.modal.modalType,
  modalProps: state.modal.modalProps
})

const connector = connect(mapStateToProps)

type ModalRootProps = ConnectedProps<typeof connector>

/**
 * Handles orchestrating what modals should be shown depending
 * on what modal type is dispatched in the modal store.
 */
const ModalRoot = ({
  isOpen,
  modalType,
  modalProps
}: ModalRootProps): JSX.Element | null => {
  if (!isOpen || !modalType || !ModalComponents[modalType]) {
    return null
  }

  const Modal = ModalComponents[modalType]

  return <Modal {...modalProps} />
}

const ConnectedModal = connector(ModalRoot)

export { ConnectedModal as default, ModalTypes }
