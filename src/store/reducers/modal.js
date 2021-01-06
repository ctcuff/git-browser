const initialState = {
  isOpen: false,
  modalType: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        isOpen: true,
        modalType: action.payload.modalType
      }
    case 'HIDE_MODAL':
      return initialState
    default:
      return state
  }
}

export default reducer
