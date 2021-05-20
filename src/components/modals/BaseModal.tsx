import '../../style/base-modal.scss'
import React from 'react'
import ReactModal from 'react-modal'
import { connect, ConnectedProps } from 'react-redux'
import { hideModal as closeModal } from '../../store/actions/modal'

const mapDispatchToProps = {
  hideModal: closeModal
}

const connector = connect(null, mapDispatchToProps)

type BaseModalProps = ConnectedProps<typeof connector> & {
  title: string
  children?: React.ReactNode
  className?: string
  actions?: ModalAction[]
}

const BaseModal = ({
  title,
  hideModal,
  children,
  className = '',
  actions = []
}: BaseModalProps): JSX.Element => (
  <ReactModal
    isOpen
    className={`modal ${className}`}
    overlayClassName="modal--overlay"
    onRequestClose={hideModal}
    shouldCloseOnOverlayClick
  >
    <div className="modal-content">
      {title && <h2 className="modal-title">{title}</h2>}
      <div className="modal-body">{children}</div>
      <div className="modal-actions">
        {actions.map(action => (
          <button
            className="action-btn"
            onClick={action.onClick}
            key={action.text}
            type="button"
          >
            {action.text}
          </button>
        ))}
        <button className="action-btn" onClick={hideModal} type="button">
          Close
        </button>
      </div>
    </div>
  </ReactModal>
)

const ConnectedBaseModal = connector(BaseModal)

export default ConnectedBaseModal
export type ModalAction = {
  text: string
  onClick: () => void
}
