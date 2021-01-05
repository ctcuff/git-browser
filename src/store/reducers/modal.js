const initialState = {
  isOpen: false,
  body: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        ...state,
        isOpen: true,
        body: action.body
      }
    case 'HIDE_MODAL':
      return {
        ...state,
        isOpen: false
      }
    default:
      return state
  }
}

export default reducer
