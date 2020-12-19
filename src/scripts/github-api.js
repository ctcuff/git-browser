const BASE_API_URL = 'https://api.github.com'
const BASE_REPO_URL = BASE_API_URL + '/repos'
const ERROR_INVALID_GITHUB_URL = 'URL must be a GitHub URL'
const ERROR_REPO_NOT_FOUND = "Couldn't find repository"
const ERROR_INVALID_QUERY = 'Could not request API, invalid query'
const UNKNOWN_SEARCH_ERROR = 'An error occurred while searching'
const UNKNOWN_REQUEST_ERROR = 'An error occurred while making the request'

const isUrlValid = url => {
  try {
    new URL(addScheme(url))
    return true
  } catch (e) {
    return false
  }
}

const isGithubUrl = url => {
  if (!isUrlValid(url)) {
    return false
  }

  try {
    const { hostname } = new URL(addScheme(url))
    return hostname.toLowerCase() === 'github.com'
  } catch (e) {
    return false
  }
}

const addScheme = url => {
  if (!url.startsWith('http') || !url.startsWith('https')) {
    return 'https://' + url
  }
  return url
}

/**
 * Takes a github url: 'https://github.com/user/repo-name'
 * and returns the string `user/repo-name`
 */
const extractRepoPath = url => {
  if (!isUrlValid(url)) {
    throw new Error(`Invalid URL: ${url}`)
  }

  const parsedUrl = new URL(addScheme(url))

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

const buildBranchUrl = (repoPath, branchName) => {
  return `${BASE_REPO_URL}/${repoPath}/git/trees/${branchName}?recursive=true`
}

const buildBranchesUrl = repoPath => {
  return `${BASE_REPO_URL}/${repoPath}/branches`
}

class GitHubAPI {
  /**
   * Takes a github url: `https://github.com/user/repo-name`, and extracts
   * `user/repo-name` to make a request to `/repos/user/repo-name`
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/repos#get-a-repository
   */
  static getRepo(repoUrl) {
    if (!isGithubUrl(repoUrl)) {
      return Promise.reject(ERROR_INVALID_GITHUB_URL)
    }

    const repoPath = extractRepoPath(repoUrl)
    const apiUrl = BASE_REPO_URL + '/' + repoPath

    return fetch(apiUrl)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        switch (res.status) {
          case 404:
            return Promise.reject(ERROR_REPO_NOT_FOUND)
          default:
            return Promise.reject(UNKNOWN_SEARCH_ERROR)
        }
      })
      .then(res => {
        if (res.message && res.message.toLowerCase() === 'not found') {
          return Promise.reject(ERROR_REPO_NOT_FOUND)
        }

        res.defaultBranchUrl = buildBranchUrl(repoPath, res.default_branch)

        return res
      })
      .catch(err => {
        console.error(err)
        return Promise.reject(err)
      })
  }

  /**
   * Takes a github api url: `https://api.github.com/repos/user/repo/git/trees/branch`,
   * and returns the tree (all files) from the given branch.
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/git#get-a-tree
   */
  static getTree(branchUrl) {
    if (!isUrlValid(branchUrl)) {
      return Promise.reject(ERROR_INVALID_QUERY)
    }

    return fetch(branchUrl)
      .then(res => res.json())
      .then(res => res.tree)
      .catch(err => {
        console.error(err)
        return Promise.reject(UNKNOWN_SEARCH_ERROR)
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
      .catch(err => {
        console.error(err)
        return Promise.reject(UNKNOWN_REQUEST_ERROR)
      })
  }

  /**
   * Takes a github url: `https://github.com/user/repo-name`,
   * and returns every branch from `/user/repo-name/branches`.
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/repos#branches
   */
  static getBranches(repoUrl) {
    if (!isGithubUrl(repoUrl)) {
      return Promise.reject(ERROR_INVALID_GITHUB_URL)
    }

    const repoPath = extractRepoPath(repoUrl)
    const branchesUrl = buildBranchesUrl(repoPath)

    return fetch(branchesUrl)
      .then(res => res.json())
      .then(res => {
        return res.map(branch => {
          // Add the branch's tree url to to the branch
          // object so we can fetch all files when it's clicked
          const branchUrl = buildBranchUrl(repoPath, branch.name)
          branch.url = branchUrl
          return branch
        })
      })
      .catch(err => {
        console.error(err)
        return Promise.reject(UNKNOWN_REQUEST_ERROR)
      })
  }
}

export default GitHubAPI
