const initialState = {
  // This will be the string: 'user/repo-name'
  repoPath: '',
  branch: ''
}

const reducer = (state = initialState, action) => {
  const payload = action.payload

  switch (action.type) {
    case 'SET_REPO_DATA':
      return {
        repoPath: payload.repoPath || state.repoPath,
        branch: payload.branch || state.branch
      }
    default:
      return state
  }
}

export default reducer
