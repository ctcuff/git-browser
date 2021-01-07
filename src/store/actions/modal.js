const showModal = (modalType, props) => ({
  type: 'SHOW_MODAL',
  payload: {
    modalType,
    modalProps: {
      ...props
    }
  }
})

const hideModal = () => ({ type: 'HIDE_MODAL' })

export { showModal, hideModal }
