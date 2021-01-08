import URLUtil, { BASE_REPO_URL } from './url-util'
import Logger from './logger'

const ERROR_INVALID_GITHUB_URL = 'Invalid GitHub URL'
const ERROR_REPO_NOT_FOUND = "Couldn't find repository"
const ERROR_FILE_NOT_FOUND = 'File not found'
const UNKNOWN_ERROR = 'An unknown error occurred'
const ERROR_BRANCH_NOT_FOUND = "Couldn't find branch"

class GitHubAPI {
  /**
   * Takes a github url: `https://github.com/user/repo-name`, and extracts
   * `user/repo-name` to make a request to `/repos/user/repo-name`
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/repos#get-a-repository
   */
  static getDefaultBranch(repoUrl) {
    if (!URLUtil.isGithubUrl(repoUrl)) {
      return Promise.reject(ERROR_INVALID_GITHUB_URL)
    }

    const repoPath = URLUtil.extractRepoPath(repoUrl)
    const apiUrl = BASE_REPO_URL + '/' + repoPath

    if (!repoPath) {
      return Promise.reject(ERROR_REPO_NOT_FOUND)
    }

    return URLUtil.request(apiUrl)
      .then(res => {
        if (res.ok) {
          return res.json()
        }

        if (res.status === 404) {
          return Promise.reject(ERROR_REPO_NOT_FOUND)
        }
      })
      .then(res => {
        const { default_branch, message } = res
        if (message && message.toLowerCase() === 'not found') {
          return Promise.reject(ERROR_REPO_NOT_FOUND)
        }
        return default_branch
      })
      .catch(err => {
        Logger.error(err)
        return Promise.reject(err)
      })
  }

  /**
   * Takes a github url: `https://github.com/user/repo/`,
   * and returns the tree (all files) from the given branch.
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/git#get-a-tree
   */
  static getTree(repoUrl, branch = 'default') {
    if (branch === 'default') {
      return GitHubAPI.getDefaultBranch(repoUrl)
        .then(branchName => this.getBranch(repoUrl, branchName))
        .catch(err => {
          Logger.error(err)
          return Promise.reject(err)
        })
    }

    return this.getBranch(repoUrl, branch)
  }

  /**
   * Takes a github url: `https://github.com/user/repo/` and a
   * branch name and returns the tree (all files).
   */
  static getBranch(repoUrl, branch) {
    const repoPath = URLUtil.extractRepoPath(repoUrl)
    const branchUrl = URLUtil.buildBranchUrl(repoPath, branch)

    if (!repoPath) {
      return Promise.reject(ERROR_REPO_NOT_FOUND)
    }

    return URLUtil.request(branchUrl)
      .then(res => {
        if (res.ok) {
          return res.json()
        }

        switch (res.status) {
          case 404:
            return Promise.reject(ERROR_BRANCH_NOT_FOUND)
          default:
            return Promise.reject(UNKNOWN_ERROR)
        }
      })
      .then(res => {
        res.branch = branch
        return res
      })
      .catch(err => {
        Logger.error(err)
        return Promise.reject(err)
      })
  }

  /**
   * Takes the url from a node in the git tree and returns
   * the base64 encoded content
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/git#get-a-blob
   */
  static getFile(url) {
    return URLUtil.request(url)
      .then(res => {
        if (res.ok) {
          return res.json()
        }

        switch (res.status) {
          case 404:
            return Promise.reject(ERROR_FILE_NOT_FOUND)
          default:
            return Promise.reject(UNKNOWN_ERROR)
        }
      })
      .then(res => res.content)
      .catch(err => {
        Logger.error(err)
        return Promise.reject(err)
      })
  }

  /**
   * Takes a github url: `https://github.com/user/repo-name`,
   * and returns every branch from `/user/repo-name/branches`.
   *
   * @see https://docs.github.com/en/free-pro-team/rest/reference/repos#branches
   */
  static getBranches(repoUrl) {
    if (!URLUtil.isGithubUrl(repoUrl)) {
      return Promise.reject(ERROR_INVALID_GITHUB_URL)
    }

    const repoPath = URLUtil.extractRepoPath(repoUrl)
    const branchesUrl = URLUtil.buildBranchesUrl(repoPath)
    let truncated = false

    if (!repoPath) {
      return Promise.reject(ERROR_REPO_NOT_FOUND)
    }

    return URLUtil.request(branchesUrl + '?per_page=100')
      .then(res => {
        if (res.ok) {
          truncated = res.headers.has('link')
          return res.json()
        }

        switch (res.status) {
          case 404:
            return Promise.reject(ERROR_REPO_NOT_FOUND)
          default:
            Promise.reject(UNKNOWN_ERROR)
        }
      })
      .then(res => {
        const branches = res.map(branch => {
          branch.repoUrl = repoUrl
          return branch
        })

        return {
          branches,
          truncated
        }
      })
      .catch(err => {
        Logger.error(err)
        return Promise.reject(err)
      })
  }
}

export default GitHubAPI
