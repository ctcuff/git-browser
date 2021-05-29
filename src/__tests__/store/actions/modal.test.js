import * as actions from 'src/store/actions/modal'

describe('modal actions', () => {
  test('showModal creates action to show a modal', () => {
    const modalType = 'MOCK_MODAL'
    const mockProps = {
      className: 'test',
      data: {
        value: 'test'
      }
    }

    expect(actions.showModal(modalType, mockProps)).toEqual({
      type: 'SHOW_MODAL',
      payload: {
        modalType,
        modalProps: mockProps
      }
    })
  })

  test('hideModal creates action to hide a modal', () => {
    expect(actions.hideModal()).toEqual({ type: 'HIDE_MODAL' })
  })
})
