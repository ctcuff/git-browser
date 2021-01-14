import modalReducer from 'src/store/reducers/modal'

const initialState = {
  isOpen: false,
  modalType: null,
  modalProps: {}
}

describe('modal reducer', () => {
  test('returns the initial state', () => {
    expect(modalReducer(undefined, {})).toEqual(initialState)
  })

  test('handles SHOW_MODAL', () => {
    const action = {
      type: 'SHOW_MODAL',
      payload: {
        modalType: 'MOCK_MODAL',
        modalProps: null
      }
    }

    expect(modalReducer(undefined, action)).toEqual({
      isOpen: true,
      modalType: action.payload.modalType,
      modalProps: {}
    })
  })

  test('handles HIDE_MODAL', () => {
    const action = { type: 'HIDE_MODAL' }
    expect(modalReducer({}, action)).toEqual(initialState)
  })
})
