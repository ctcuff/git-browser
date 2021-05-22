import { Theme, SettingsAction } from '../actions/settings'

const initialState: SettingsState = {
  theme: {
    // The theme the user has currently selected
    userTheme: 'theme-auto',
    // The theme of the user's system
    preferredTheme: 'theme-light'
  }
}

const reducer = (
  state: SettingsState = initialState,
  action: SettingsAction
): SettingsState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        theme: {
          ...state.theme,
          userTheme: action.payload.userTheme
        }
      }
    case 'SET_PREFERRED_THEME':
      return {
        theme: {
          ...state.theme,
          preferredTheme: action.payload.preferredTheme
        }
      }
    default:
      return state
  }
}

export default reducer
export type SettingsState = {
  theme: {
    userTheme: Theme
    preferredTheme: Theme
  }
}
