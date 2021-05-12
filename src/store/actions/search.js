const setRepoData = payload => ({
  type: 'SET_REPO_DATA',
  payload: {
    repoPath: payload.repoPath,
    branch: payload.branch
  }
})

export { setRepoData }
