import { ModalAction } from '../actions/modal'

const initialState = {
  isOpen: false,
  modalType: '',
  modalProps: {}
}

const reducer = (
  state: ModalState = initialState,
  action: ModalAction
): ModalState => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        isOpen: true,
        modalType: action.payload.modalType,
        modalProps: action.payload.modalProps || {}
      }
    case 'HIDE_MODAL':
      return initialState
    default:
      return state
  }
}

export default reducer

export type ModalState = {
  isOpen: boolean
  modalType: string
  modalProps: {
    [key: string]: unknown
  }
}
