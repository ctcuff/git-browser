const initialState = {
  theme: {
    // The theme the user has currently selected
    userTheme: 'theme-auto',
    // The theme of the user's system
    preferredTheme: 'theme-light'
  }
}

const reducer = (state = initialState, action) => {
  const { payload } = action

  switch (action.type) {
    case 'SET_THEME':
      return {
        theme: {
          ...state.theme,
          userTheme: payload.userTheme
        }
      }
    case 'SET_PREFERRED_THEME':
      return {
        theme: {
          ...state.theme,
          preferredTheme: payload.preferredTheme
        }
      }
    default:
      return state
  }
}

export default reducer
