import { Octokit } from '@octokit/rest'
import URLUtil, { BASE_REPO_URL } from './url-util'
import Logger from './logger'
import {
  GitHubRepo,
  GitHubError,
  GitHubBranchInfo,
  GitHubBlob,
  GitHubBranch
} from '../@types/github-api'

// Eslint bug with enums.
// eslint-disable-next-line no-shadow
enum ErrorMsg {
  INVALID_GITHUB_URL = 'Invalid Github URL',
  REPO_NOT_FOUND = "Couldn't find repository",
  FILE_NOT_FOUND = 'File not found',
  UNKNOWN = 'An unknown error occurred',
  BRANCH_NOT_FOUND = "Couldn't find branch"
}

const octokit = new Octokit()

class GitHubAPI {
  /**
   * Takes a github url: `https://github.com/user/repo-name`, and extracts
   * `user/repo-name` to make a request to `/repos/user/repo-name`
   *
   * @see https://docs.github.com/rest/reference/repos#get-a-repository
   */
  public static async getDefaultBranch(repoUrl: string): Promise<string> {
    if (!URLUtil.isGithubUrl(repoUrl)) {
      throw new Error(ErrorMsg.INVALID_GITHUB_URL)
    }

    const [owner, repo] = URLUtil.decomposeURL(repoUrl)
    console.log(owner + repo)
    const repoPath = URLUtil.extractRepoPath(repoUrl)

    if (!repoPath) {
      throw new Error(ErrorMsg.REPO_NOT_FOUND)
    }

    try {
      const fetchedRepo = await octokit.repos.get({ owner, repo })
      return fetchedRepo.data.default_branch
    } catch (err) {
      Logger.error(err)
      throw err
    }
  }

  /**
   * Takes a github url: `https://github.com/user/repo/`,
   * and returns the tree (all files) from the given branch. If the branch is
   * "default", it'll return the tree for the default branch
   *
   * @see https://docs.github.com/rest/reference/git#get-a-tree
   */
  public static getTree(
    repoUrl: string,
    branch = 'default'
  ): Promise<GitHubBranchInfo & { branch: string }> {
    if (branch === 'default') {
      return GitHubAPI.getDefaultBranch(repoUrl)
        .then(branchName => GitHubAPI.getBranch(repoUrl, branchName))
        .catch(err => {
          Logger.error(err)
          return Promise.reject(err)
        })
    }

    return GitHubAPI.getBranch(repoUrl, branch)
  }

  /**
   * Takes a github url: `https://github.com/user/repo/` and a
   * branch name and returns the tree (all files).
   */
  public static getBranch(
    repoUrl: string,
    branch: string
  ): Promise<GitHubBranchInfo & { branch: string }> {
    const repoPath = URLUtil.extractRepoPath(repoUrl)

    if (!repoPath) {
      Logger.error('Invalid repo path')
      return Promise.reject(new Error(ErrorMsg.UNKNOWN))
    }

    const branchUrl = URLUtil.buildBranchUrl(repoPath, branch)

    return URLUtil.request(branchUrl)
      .then(res => {
        if (res.ok) {
          return res.json()
        }

        switch (res.status) {
          case 404:
            return Promise.reject(new Error(ErrorMsg.BRANCH_NOT_FOUND))
          default:
            return Promise.reject(new Error(ErrorMsg.UNKNOWN))
        }
      })
      .then((res: GitHubBranchInfo) => ({
        ...res,
        branch
      }))
      .catch(err => {
        Logger.error(err)
        return Promise.reject(err)
      })
  }

  /**
   * Takes the url from a node in the git tree and returns
   * the base64 encoded content
   *
   * @see https://docs.github.com/rest/reference/git#get-a-blob
   */
  public static getFile(url: string): Promise<string> {
    return URLUtil.request(url)
      .then(res => {
        if (res.ok) {
          return res.json()
        }

        switch (res.status) {
          case 404:
            return Promise.reject(new Error(ErrorMsg.FILE_NOT_FOUND))
          default:
            return Promise.reject(new Error(ErrorMsg.UNKNOWN))
        }
      })
      .then((res: GitHubBlob) => res.content)
      .catch(err => {
        Logger.error(err)
        return Promise.reject(err)
      })
  }

  /**
   * Takes a github url: `https://github.com/user/repo-name`,
   * and returns every branch from `/user/repo-name/branches`.
   *
   * @see https://docs.github.com/rest/reference/repos#branches
   */
  public static getBranches(repoUrl: string): Promise<{
    branches: (GitHubBranch & { repoUrl: string })[]
    truncated: boolean
  }> {
    if (!URLUtil.isGithubUrl(repoUrl)) {
      return Promise.reject(new Error(ErrorMsg.INVALID_GITHUB_URL))
    }

    const repoPath = URLUtil.extractRepoPath(repoUrl)

    if (!repoPath) {
      Logger.error('Invalid repo path')
      return Promise.reject(new Error(ErrorMsg.UNKNOWN))
    }

    const branchesUrl = URLUtil.buildBranchesUrl(repoPath)
    let truncated = false

    return URLUtil.request(`${branchesUrl}?per_page=100`)
      .then(res => {
        if (res.ok) {
          truncated = res.headers.has('link')
          return res.json()
        }

        switch (res.status) {
          case 404:
            return Promise.reject(new Error(ErrorMsg.UNKNOWN))
          default:
            return Promise.reject(new Error(ErrorMsg.UNKNOWN))
        }
      })
      .then((res: GitHubBranch[]) => {
        const branches = res.map(branch => ({
          ...branch,
          repoUrl
        }))

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
