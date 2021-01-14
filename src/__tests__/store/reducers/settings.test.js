import settingsReducer from 'src/store/reducers/settings'

describe('settings reducer', () => {
  test('returns initial state', () => {
    expect(settingsReducer(undefined, {})).toEqual({ theme: 'theme-light' })
  })

  test('handles SET_THEME', () => {
    const action = {
      type: 'SET_THEME',
      payload: {
        theme: 'mock-theme'
      }
    }

    expect(settingsReducer({}, action)).toEqual({ theme: action.payload.theme })
  })
})
