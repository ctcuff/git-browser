const initialState = {
  userTheme: 'theme-light',
  preferredTheme: 'theme-light'
}

const reducer = (state = initialState, action) => {
  const payload = action.payload

  switch (action.type) {
    case 'SET_THEME':
      return {
        userTheme: payload.userTheme,
        preferredTheme: state.preferredTheme
      }
    case 'SET_PREFERRED_THEME':
      return {
        userTheme: state.userTheme,
        preferredTheme: payload.preferredTheme
      }
    default:
      return state
  }
}

export default reducer
