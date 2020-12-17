const BASE_API_URL = 'https://api.github.com'
const BASE_REPO_URL = BASE_API_URL + '/repos'

const isUrlValid = url => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Takes a github url: 'https://github.com/user/repo-name'
 * and returns the string 'user/repo-name'
 */
const extractRepoPath = url => {
  if (!isUrlValid(url)) {
    throw new Error(`Invalid URL: ${url}`)
  }

  const parsedUrl = new URL(url)

  if (!parsedUrl.pathname) {
    throw new Error(`Error retrieving pathname from URL ${url}`)
  }

  let path = parsedUrl.pathname

  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  if (path.endsWith('/')) {
    path = path.slice(0, path.length - 1)
  }

  return path
}

window.isUrlValid = isUrlValid
window.extractRepoPath = extractRepoPath

const buildBranchUrl = (repoPath, branchName) => {
  return `${BASE_REPO_URL}/${repoPath}/git/trees/${branchName}?recursive=true`
}

class GitHubAPI {
  static Errors = {
    NOT_FOUND: 'NOT_FOUND'
  }

  /**
   * Takes a github url: `https://github.com/user/repo-name`, and extracts
   * `user/repo-name` to make a request to `/repos/user/repo-name`
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/repos#get-a-repository
   */
  static getRepo(repoUrl) {
    if (!isUrlValid(repoUrl)) {
      return Promise.reject(`Invalid URL: ${repoUrl}`)
    }

    const apiUrl = BASE_REPO_URL + '/' + extractRepoPath(repoUrl)

    return fetch(apiUrl)
      .then(res => res.json())
      .then(res => {
        if (res.message && res.message.toLowerCase() === 'not found') {
          return Promise.reject(GitHubAPI.Errors.NOT_FOUND)
        }
        return res
      })
      .catch(err => Promise.reject(err))
  }

  /**
   * Takes a github url: https://github.com/user/repo-name,
   * and returns the tree (all files) from the given branch.
   * This defaults to `default_branch` returned by the GitHub API
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/git#get-a-tree
   */
  static getTree(repoUrl, branchName = null) {
    return GitHubAPI.getRepo(repoUrl).then(res => {
      const branchUrl = buildBranchUrl(
        extractRepoPath(repoUrl),
        branchName || res.default_branch
      )

      return fetch(branchUrl)
        .then(res => res.json())
        .catch(err => Promise.reject(err))
    })
  }

  /**
   * Takes the url from a node in the git tree and returns
   * the base64 encoded content
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/git#get-a-blob
   */
  static getFile(url) {
    return fetch(url)
    .then(res => res.json())
    .then(res => res.content)
    .catch(err => Promise.reject(err))
  }
}

export default GitHubAPI
