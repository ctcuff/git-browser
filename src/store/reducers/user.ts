import { UserAction } from '../actions/user'

const initialState = {
  accessToken: '',
  username: '',
  isLoggedIn: false,
  isLoading: false
}

const reducer = (
  state: UserState = initialState,
  action: UserAction
): UserState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        username: action.payload.username,
        isLoggedIn: true
      }
    case 'LOGOUT':
      return initialState
    case 'TOGGLE_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading
      }
    default:
      return state
  }
}

export default reducer
export type UserState = {
  accessToken: string
  username: string
  isLoggedIn: boolean
  isLoading: boolean
}
