const setRepoData = payload => ({
  type: 'SET_REPO_DATA',
  payload: {
    repoPath: payload.repoPath,
    branch: payload.branch
  }
})

// eslint-disable-next-line import/prefer-default-export
export { setRepoData }
