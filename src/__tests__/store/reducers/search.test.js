import searchReducer from 'src/store/reducers/search'

const initialState = {
  repoPath: '',
  branch: ''
}

describe('search reducer', () => {
  test('returns the initial state', () => {
    expect(searchReducer(undefined, {})).toEqual(initialState)
  })

  test('handles SET_REPO_DATA', () => {
    const action = {
      type: 'SET_REPO_DATA',
      payload: {
        repoPath: 'user/repo',
        branch: 'main'
      }
    }

    expect(searchReducer(undefined, action)).toEqual({
      repoPath: 'user/repo',
      branch: 'main'
    })

    action.payload.repoPath = null
    action.payload.branch = null

    expect(searchReducer(undefined, action)).toEqual({
      repoPath: initialState.repoPath,
      branch: initialState.branch
    })
  })
})
