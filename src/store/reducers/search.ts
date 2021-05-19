import { SearchAction } from '../actions/search'

const initialState = {
  repoPath: '',
  branch: ''
}

const reducer = (
  state: SearchState = initialState,
  action: SearchAction
): SearchState => {
  switch (action.type) {
    case 'SET_REPO_DATA':
      return {
        repoPath: action.payload.repoPath || state.repoPath,
        branch: action.payload.branch || state.branch
      }
    default:
      return state
  }
}

export default reducer
export type SearchState = {
  /**
   * This will be the string: 'user/repo-name'
   */
  repoPath: string
  branch: string
}
