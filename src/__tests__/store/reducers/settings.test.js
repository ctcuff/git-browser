import settingsReducer from 'src/store/reducers/settings'

describe('settings reducer', () => {
  test('returns initial state', () => {
    expect(settingsReducer(undefined, {})).toEqual({
      userTheme: 'theme-light',
      preferredTheme: 'theme-light'
    })
  })

  test('handles SET_THEME', () => {
    const action = {
      type: 'SET_THEME',
      payload: {
        userTheme: 'mock-theme'
      }
    }

    expect(settingsReducer({}, action)).toEqual({
      userTheme: action.payload.userTheme
    })
  })

  test('handles SET_PREFERRED_THEME', () => {
    const action = {
      type: 'SET_PREFERRED_THEME',
      payload: {
        preferredTheme: 'mock-theme'
      }
    }

    expect(settingsReducer({}, action)).toEqual({
      preferredTheme: action.payload.preferredTheme
    })
  })
})
