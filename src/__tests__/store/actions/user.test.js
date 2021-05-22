import createTestStore from 'src/__mocks__/store'
import * as actions from 'src/store/actions/user'
import firebase from 'src/__mocks__/firebase'
import { ModalTypes } from 'src/components/ModalRoot'

let store
const initialState = {
  accessToken: '',
  username: '',
  isLoggedIn: false,
  isLoading: false
}

describe('user actions', () => {
  beforeEach(() => {
    store = createTestStore()
  })

  test('toggleLoading creates action to toggle loading', () => {
    const type = 'TOGGLE_LOADING'

    expect(actions.toggleLoading(true)).toEqual({
      type,
      payload: {
        isLoading: true
      }
    })
  })

  test('loadProfileFromStorage creates action with payload', () => {
    const type = 'LOGIN'
    const mockPayload = {
      value1: 'test1',
      value2: 'test2',
      some: {
        nested: {
          value3: 'test3'
        }
      }
    }

    expect(actions.loadProfileFromStorage(mockPayload)).toEqual({
      type,
      payload: {
        ...mockPayload
      }
    })
  })

  test('login creates action to login', async () => {
    const resp = firebase.auth().signInWithPopup()
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
    const expectedData = {
      accessToken: resp.credential.accessToken,
      username: resp.additionalUserInfo.username
    }

    store.dispatch(actions.toggleLoading(true))
    await store.dispatch(actions.login())

    expect(firebase.auth().signInWithPopup).not.toHaveBeenCalled()

    store.dispatch(actions.toggleLoading(false))
    await store.dispatch(actions.login())

    expect(setItemSpy).toHaveBeenCalledWith(
      'profile',
      JSON.stringify(expectedData)
    )
  })

  test('login shows modal on auth error', async () => {
    jest.spyOn(firebase, 'auth').mockReturnValueOnce(() => ({
      signInWithPopup: () => {
        throw new Error({ code: 'mock-error' })
      }
    }))

    await store.dispatch(actions.login())

    expect(store.getState().modal).toEqual({
      isOpen: true,
      modalType: ModalTypes.AUTH_ERROR,
      modalProps: {}
    })
  })

  test('logout creates action to logout', async () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
    localStorage.setItem('profile', 'mockValue')

    store.dispatch(actions.toggleLoading(true))
    store.dispatch(
      actions.loadProfileFromStorage({
        accessToken: 'mockToken',
        username: 'mock-user'
      })
    )

    await store.dispatch(actions.logout())

    expect(removeItemSpy).not.toHaveBeenCalled()

    store.dispatch(actions.toggleLoading(false))
    await store.dispatch(actions.logout())

    expect(removeItemSpy).toHaveBeenCalledWith('profile')
    expect(localStorage.getItem('profile')).toEqual(null)
    expect(store.getState().user).toEqual(initialState)
  })
})
