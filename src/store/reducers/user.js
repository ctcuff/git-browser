const initialState = {
  accessToken: null,
  username: null,
  isLoggedIn: false,
  isLoading: false
}

const reducer = (state = initialState, action) => {
  const payload = action.payload

  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        accessToken: payload.accessToken,
        username: payload.username,
        isLoggedIn: true
      }
    case 'LOGOUT':
      return initialState
    case 'TOGGLE_LOADING':
      return {
        ...state,
        isLoading: payload.isLoading
      }
    default:
      return state
  }
}

export default reducer
