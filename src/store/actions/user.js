import firebase from 'firebase/app'
import 'firebase/auth'
import Logger from '../../scripts/logger'
import { showModal } from './modal'
import { ModalTypes } from '../../components/ModalRoot'

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

const loadProfileFromStorage = payload => ({
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

      if (res.additionalUserInfo) {
        payload.username = res.additionalUserInfo.username
      }

      localStorage.setItem('profile', JSON.stringify({ ...payload }))

      dispatch(loadProfileFromStorage(payload))
    } catch (err) {
      Logger.warn(err)

      dispatch(
        showModal(ModalTypes.AUTH_ERROR, {
          code: err.code
        })
      )
    }

    dispatch(toggleLoading(false))
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
  }
}

export { login, logout, loadProfileFromStorage, toggleLoading }
