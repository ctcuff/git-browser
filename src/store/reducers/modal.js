const initialState = {
  isOpen: false,
  modalType: null,
  modalProps: {}
}

const reducer = (state = initialState, action) => {
  const payload = action.payload

  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        isOpen: true,
        modalType: payload.modalType,
        modalProps: payload.modalProps || {}
      }
    case 'HIDE_MODAL':
      return initialState
    default:
      return state
  }
}

export default reducer
