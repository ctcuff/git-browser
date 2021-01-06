const showModal = modalType => ({
  type: 'SHOW_MODAL',
  payload: {
    modalType
  }
})

const hideModal = () => ({ type: 'HIDE_MODAL' })

export { showModal, hideModal }
