const initialState = {
  content: 'Default starting value',
  language: 'plaintext'
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_CONTENT':
      return {
        ...state,
        content: action.content
      }
    default:
      return state
  }
}

export default reducer
