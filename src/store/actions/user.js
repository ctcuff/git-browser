import firebase from 'firebase/app'
import 'firebase/auth'
import Logger from '../../scripts/logger'
import GitHubAPI from '../../scripts/github-api'

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
})

const provider = new firebase.auth.GithubAuthProvider()

const toggleLoading = isLoading => ({
  type: 'TOGGLE_LOADING',
  payload: {
    isLoading
  }
})

const updateRateLimit = () => {
  return async function (dispatch) {
    try {
      const { limit, remaining, reset } = await GitHubAPI.checkRateLimit()

      dispatch({
        type: 'UPDATE_RATE_LIMIT',
        payload: {
          limit,
          remaining,
          reset
        }
      })
    } catch (err) {
      Logger.error(err)
    }
  }
}

const authenticate = payload => ({
  type: 'LOGIN',
  payload
})

const login = () => {
  return async function (dispatch, getState) {
    if (getState().user.isLoading) {
      return
    }

    dispatch(toggleLoading(true))

    try {
      const res = await firebase.auth().signInWithPopup(provider)
      const accessToken = res.credential.accessToken
      const payload = { accessToken }

      if (res.additionalUserInfo && res.additionalUserInfo.profile) {
        payload.username = res.additionalUserInfo.username
        payload.avatarUrl = res.additionalUserInfo.profile.avatar_url
      }

      localStorage.setItem('profile', JSON.stringify({ ...payload }))

      dispatch(authenticate(payload))
    } catch (err) {
      Logger.error(err)
    }

    dispatch(toggleLoading(false))
    dispatch(updateRateLimit())
  }
}

const logout = () => {
  return async function (dispatch, getState) {
    if (getState().user.isLoading) {
      return
    }

    dispatch(toggleLoading(true))
    localStorage.removeItem('profile')

    try {
      await firebase.auth().signOut()
      dispatch({ type: 'LOGOUT' })
    } catch (err) {
      Logger.error(err)
    }

    dispatch(toggleLoading(false))
    dispatch(updateRateLimit())
  }
}

export { login, logout, updateRateLimit, authenticate }
