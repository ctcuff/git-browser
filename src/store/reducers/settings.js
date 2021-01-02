const initialState = {
  theme: 'theme-light'
}

const reducer = (state = initialState, action) => {
  const payload = action.payload

  switch (action.type) {
    case 'SET_THEME':
      return {
        theme: payload.theme
      }
    default:
      return state
  }
}

export default reducer
