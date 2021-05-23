import { Octokit } from '@octokit/rest'
import URLUtil from './url-util'
import Logger from './logger'
import { Blob, TreeResponse, BranchListResponse } from '../@types/github-api'
import store from '../store'

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

// Wraps each request with the auth header.
octokit.hook.wrap('request', async (request, options) => {
  const oauthToken = store.getState().user.accessToken
  const debugToken = process.env.OAUTH_TOKEN

  if (process.env.DEBUG && debugToken) {
    options.headers.authorization = `token ${debugToken}`
  } else if (oauthToken) {
    options.headers.authorization = `token ${oauthToken}`
  }

  return request(options)
})

// octokit.hook.wrap('request', async (request, options) => {
//   Logger.info(oauthToken)
//   const debugToken = process.env.OAUTH_TOKEN
//   options.headers.authorization = oauthToken
//   return options
// })

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
  public static async getTree(
    repoUrl: string,
    branch = 'default'
  ): Promise<TreeResponse & { branch: string }> {
    const [owner, repo] = URLUtil.decomposeURL(repoUrl)
    if (branch === 'default') {
      try {
        const branchName = await GitHubAPI.getDefaultBranch(repoUrl)
        const tree = await octokit.git.getTree({
          owner,
          repo,
          tree_sha: branchName,
          recursive: 'true'
        })
        return { ...tree, branch: branchName }
      } catch (err) {
        Logger.error(err)
        throw err
      }
    }

    return GitHubAPI.getBranch(repoUrl, branch)
  }

  /**
   * Takes a github url: `https://github.com/user/repo/` and a
   * branch name and returns the tree (all files).
   */
  public static async getBranch(
    repoUrl: string,
    branch: string
  ): Promise<TreeResponse & { branch: string }> {
    const repoPath = URLUtil.extractRepoPath(repoUrl)

    if (!repoPath) {
      Logger.error('Invalid repo path')
      return Promise.reject(new Error(ErrorMsg.UNKNOWN))
    }

    const [owner, repo] = URLUtil.decomposeURL(repoUrl)

    const res = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: 'true'
    })

    return { ...res, branch }
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
            throw new Error(ErrorMsg.FILE_NOT_FOUND)
          default:
            throw new Error(ErrorMsg.UNKNOWN)
        }
      })
      .then((res: Blob) => res.content)
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
  public static async getBranches(repoUrl: string): Promise<{
    branches: BranchListResponse['data']
    truncated: boolean
  }> {
    if (!URLUtil.isGithubUrl(repoUrl)) {
      return Promise.reject(new Error(ErrorMsg.INVALID_GITHUB_URL))
    }

    const [owner, repo] = URLUtil.decomposeURL(repoUrl)
    const response = await octokit.repos.listBranches({ owner, repo })

    let truncated = false
    if (response.headers.link) {
      truncated = true
    }

    return { branches: response.data, truncated }
  }
}

export default GitHubAPI
