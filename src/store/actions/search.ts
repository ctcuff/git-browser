import { SearchState } from '../reducers/search'

type SetRepoDataAction = {
  type: 'SET_REPO_DATA'
  payload: SearchState
}

const setRepoData = (payload: SearchState): SetRepoDataAction => ({
  type: 'SET_REPO_DATA',
  payload: {
    repoPath: payload.repoPath,
    branch: payload.branch
  }
})

// eslint-disable-next-line import/prefer-default-export
export { setRepoData }
export type SearchAction = SetRepoDataAction
