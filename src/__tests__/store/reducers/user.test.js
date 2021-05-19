import userReducer from 'src/store/reducers/user'

const initialState = {
  accessToken: '',
  username: '',
  isLoggedIn: false,
  isLoading: false
}

describe('user reducer', () => {
  test('returns initial state', () => {
    expect(userReducer(undefined, {})).toEqual(initialState)
  })

  test('handles LOGIN', () => {
    const action = {
      type: 'LOGIN',
      payload: {
        accessToken: 'mock-token',
        username: 'mock-user'
      }
    }

    expect(userReducer(initialState, action)).toEqual({
      ...initialState,
      accessToken: action.payload.accessToken,
      username: action.payload.username,
      isLoggedIn: true
    })
  })

  test('handles LOGOUT', () => {
    const action = { type: 'LOGOUT' }
    expect(userReducer({}, action)).toEqual(initialState)
  })

  test('handles TOGGLE_LOADING', () => {
    const action = {
      type: 'TOGGLE_LOADING',
      payload: {
        isLoading: true
      }
    }

    expect(userReducer(initialState, action)).toEqual({
      ...initialState,
      isLoading: action.payload.isLoading
    })
  })
})
