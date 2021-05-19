type ShowModalAction = {
  type: 'SHOW_MODAL'
  payload: {
    modalType: string
    modalProps: {
      [key: string]: unknown
    }
  }
}

type HideModalAction = {
  type: 'HIDE_MODAL'
}

const showModal = (
  modalType: string,
  props: { [key: string]: unknown } = {}
): ShowModalAction => ({
  type: 'SHOW_MODAL',
  payload: {
    modalType,
    modalProps: {
      ...props
    }
  }
})

const hideModal = (): HideModalAction => ({ type: 'HIDE_MODAL' })

export { showModal, hideModal }
export type ModalAction = ShowModalAction | HideModalAction
