// eslint-disable-next-line import/no-extraneous-dependencies
import firebase from 'firebase/app'
// eslint-disable-next-line import/no-extraneous-dependencies
import 'firebase/auth'
import { ActionCreator, Dispatch } from 'redux'
import Logger from '../../scripts/logger'
import { showModal } from './modal'
import { ModalTypes } from '../../components/ModalRoot'
import { State } from '..'

type UserInfoPayload = {
  accessToken: string
  username: string
}

type ToggleLoadingAction = {
  type: 'TOGGLE_LOADING'
  payload: {
    isLoading: boolean
  }
}

type LoadProfileAction = {
  type: 'LOGIN'
  payload: UserInfoPayload
}

type LogoutAction = {
  type: 'LOGOUT'
}

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
})

// Firebase doesn't allow us to remove scope once added so we need
// to create 2 providers
const baseProvider = new firebase.auth.GithubAuthProvider()
const enhancedProvider = new firebase.auth.GithubAuthProvider()

// Grants access to private and public repositories.
enhancedProvider.addScope('repo')

const toggleLoading = (isLoading: boolean): ToggleLoadingAction => ({
  type: 'TOGGLE_LOADING',
  payload: {
    isLoading
  }
})

const clearUserInfo = (): LogoutAction => ({ type: 'LOGOUT' })

const loadProfileFromStorage = (
  payload: UserInfoPayload
): LoadProfileAction => ({
  type: 'LOGIN',
  payload
})

const login = (su = false): ActionCreator<void> => {
  return async function (dispatch: Dispatch, getState: () => State) {
    if (getState().user.isLoading) {
      return
    }

    const provider = su ? enhancedProvider : baseProvider

    dispatch(toggleLoading(true))

    try {
      const res = await firebase.auth().signInWithPopup(provider)
      const credential = res.credential as firebase.auth.OAuthCredential
      const payload: UserInfoPayload = {
        accessToken: 's',
        username: ''
      }

      payload.accessToken = credential.accessToken || ''
      payload.username = res.additionalUserInfo?.username || ''

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

const logout = (): ActionCreator<void> => {
  return async function (dispatch: Dispatch, getState: () => State) {
    if (getState().user.isLoading) {
      return
    }

    dispatch(toggleLoading(true))
    localStorage.removeItem('profile')

    try {
      await firebase.auth().signOut()
      dispatch(clearUserInfo())
    } catch (err) {
      Logger.error(err)
    }

    dispatch(toggleLoading(false))
  }
}

export { login, logout, loadProfileFromStorage, toggleLoading }
export type UserAction = ToggleLoadingAction | LoadProfileAction | LogoutAction
