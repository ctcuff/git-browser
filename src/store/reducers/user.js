const initialState = {
  accessToken: null,
  avatarUrl: null,
  username: null,
  isLoggedIn: false,
  isLoading: false,
  rateLimit: {
    remaining: 0,
    limit: 0,
    reset: null
  }
}

const reducer = (state = initialState, action) => {
  const payload = action.payload

  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        accessToken: payload.accessToken,
        avatarUrl: payload.avatarUrl,
        username: payload.username,
        isLoggedIn: true
      }
    case 'LOGOUT':
      return {
        ...initialState,
        rateLimit: {
          ...state.rateLimit
        }
      }
    case 'TOGGLE_LOADING':
      return {
        ...state,
        isLoading: payload.isLoading
      }
    case 'UPDATE_RATE_LIMIT':
      return {
        ...state,
        rateLimit: {
          remaining: payload.remaining,
          limit: payload.limit,
          reset: payload.reset
        }
      }
    default:
      return state
  }
}

export default reducer
