const initialState = {
  isOpen: false
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return { isOpen: true }
    case 'HIDE_MODAL':
      return { isOpen: false }
    default:
      return state
  }
}

export default reducer
