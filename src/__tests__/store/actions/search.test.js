import * as actions from 'src/store/actions/search'

describe('search actions', () => {
  test('setRepoData creates action to set data', () => {
    expect(
      actions.setRepoData({
        repoPath: 'user/repo',
        branch: 'main'
      })
    ).toEqual({
      type: 'SET_REPO_DATA',
      payload: {
        repoPath: 'user/repo',
        branch: 'main'
      }
    })
  })
})
