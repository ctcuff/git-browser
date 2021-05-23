import URI from 'urijs'
import store from '../store'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from '../components/ModalRoot'
import Logger from './logger'

const BASE_API_URL = 'https://api.github.com'
const BASE_REPO_URL = `${BASE_API_URL}/repos`

type RequestConfig = {
  headers: {
    Authorization?: string
  }
}

type RepoPathParams = {
  repoPath: string
  branch: string
  filePath: string
  raw?: boolean
}

class URLUtil {
  /**
   * A wrapper around fetch that makes a request to the GitHub API.
   * This rejects if the GitHub rate limit is exceeded.
   */
  public static request(url: string): Promise<Response> {
    const oauthToken = store.getState().user.accessToken
    const debugToken = process.env.OAUTH_TOKEN
    const config: RequestConfig = {
      headers: {}
    }

    if (process.env.DEBUG && debugToken) {
      config.headers.Authorization = `token ${debugToken}`
    } else if (oauthToken) {
      config.headers.Authorization = `token ${oauthToken}`
    }

    return new Promise((resolve, reject) => {
      fetch(url, config)
        .then(res => {
          const rateLimitRemaining =
            res.headers.get('x-ratelimit-remaining') || ''

          if (parseInt(rateLimitRemaining, 10) === 0) {
            reject(new Error('rate limit exceeded'))
            store.dispatch(showModal(ModalTypes.RATE_LIMIT))
          } else {
            resolve(res)
          }
        })
        .catch(err => reject(err))
    })
  }

  public static isUrlValid(url: string): boolean {
    try {
      // eslint-disable-next-line no-new
      new URL(this.addScheme(url))
      return true
    } catch (e) {
      return false
    }
  }

  public static isGithubUrl(url: string): boolean {
    if (!this.isUrlValid(url)) {
      return false
    }

    const uri = new URI(this.addScheme(url))

    return uri.hostname().toLowerCase().trim() === 'github.com'
  }

  /**
   * Adds `https://` to a url if that or `http://` isn't present
   */
  public static addScheme(url: string): string {
    if (!url.startsWith('http') || !url.startsWith('https')) {
      return `https://${url}`
    }
    return url
  }

  /**
   * Takes a github url: `https://github.com/user/repo-name`
   * and returns the string `user/repo-name`
   */
  public static extractRepoPath(url: string): string | null {
    if (!this.isUrlValid(url)) {
      throw new Error(`Invalid URL: ${url}`)
    }

    const uri = new URI(this.addScheme(url))
    const segments = uri.segment().filter(str => !!str.trim())

    if (segments.length < 2) {
      return null
    }

    return `${segments[0]}/${segments[1]}`
  }

  public static decomposeURL(url: string): string[] {
    if (!this.isUrlValid(url)) {
      throw new Error(`Invalid URL: ${url}`)
    }

    const uri = new URI(this.addScheme(url))
    const components = uri.segment()

    if (components.length < 2) {
      throw new Error("URL should be in format 'https://base/user/repo'")
    }

    return components
  }

  public static buildBranchUrl(repoPath: string, branchName: string): string {
    return `${BASE_REPO_URL}/${repoPath}/git/trees/${branchName}?recursive=true`
  }

  static buildBranchesUrl(repoPath: string): string {
    return `${BASE_REPO_URL}/${repoPath}/branches`
  }

  /**
   * Takes an object and appends each key and value to the window URL as a query.
   * Any false value is removed from the URL.
   * ```
   * URLUtil.updateURLSearchParams({
   *  "repo": "user/name",
   *  "path": null,
   *  "file": "test.css"
   * })
   *
   * ```
   * appends `?repo=user%2Fname&file=test.css` to the URL
   */
  static updateURLSearchParams(queryObj: {
    [key: string]: string | null
  }): void {
    const prevUrl = window.location.pathname + window.location.search
    const searchParams = new URLSearchParams(window.location.search)
    let newUrl = window.location.pathname

    Object.keys(queryObj).forEach(key => {
      if (queryObj[key]) {
        searchParams.set(key, queryObj[key] as string)
      } else {
        searchParams.delete(key)
      }
    })

    const params = searchParams.toString()

    // Make sure we don't append a naked `?` to the end of the URL
    // if there are no search params
    if (params) {
      newUrl += `?${params}`
    }

    if (prevUrl !== newUrl) {
      window.history.replaceState({}, '', newUrl)
    }
  }

  /**
   * Takes a key and return the value of that search param from current URL.
   * If defaultValue is present, that's returned instead if `key` isn't found.
   */
  static getSearchParam(key: string, defaultValue = ''): string {
    const params = new URLSearchParams(window.location.search)
    return params.get(key) ?? defaultValue
  }

  /**
   * Takes a repo path (`user/repo-name`), branch, and file path and returns
   * a URL to view that file on GitHub. If `raw` is `true`, this will return
   * a link similar to clicking the "raw" button on github.
   */
  buildGithubFileURL(params: RepoPathParams): string {
    const { repoPath, branch, filePath, raw = false } = params

    let URL = `https://github.com/${repoPath}/blob/${branch}/${filePath}`

    if (raw) {
      URL += '?raw=true'
    }

    return URL
  }

  /**
   * Takes a path name and replaces the current URL path name
   */
  static updateURLPath(path: string): void {
    let normalizedPath = path

    // Adding a leading / to the path replaces the entire URL
    // pathname with `path`
    if (!path.startsWith('/')) {
      normalizedPath = `/${path}`
    }

    window.history.replaceState({}, '', normalizedPath)
  }

  /**
   * Takes a repo path (`user/repo-name`), branch, and file path and returns
   * a URL to view that file on GitHub. If `raw` is `true`, this will return
   * a link similar to clicking the "raw" button on github.
   */
  static buildGithubFileURL(params: RepoPathParams): string {
    const { repoPath, branch, filePath, raw = false } = params

    const url = raw
      ? `https://raw.githubusercontent.com/${repoPath}/${branch}/${filePath}`
      : `https://github.com/${repoPath}/blob/${branch}/${filePath}`

    return url
  }

  /**
   * Takes a repo path (`user/repo-name`), branch, and file path and
   * downloads that file from github using the `raw.githubusercontent` URL
   */
  static downloadGithubFile(params: RepoPathParams): Promise<void> {
    const githubURL = URLUtil.buildGithubFileURL({
      ...params,
      raw: true
    })
    const parts = params.filePath.split('/')
    const filename = parts[parts.length - 1]

    return new Promise((resolve, reject) => {
      fetch(githubURL)
        .then(res => {
          if (!res.ok) {
            reject(new Error('Error downloading file'))
            return null
          }

          return res.blob()
        })
        .then(blob => {
          const anchor = document.createElement('a')
          const url = URL.createObjectURL(blob)

          anchor.setAttribute('href', url)
          anchor.setAttribute('download', filename)
          anchor.style.visibility = 'hidden'

          document.body.appendChild(anchor)

          anchor.click()
          anchor.remove()

          resolve()
        })
        .catch(err => {
          Logger.error(err)
          reject(new Error('Error downloading file'))
        })
    })
  }
}

export { URLUtil as default, BASE_API_URL, BASE_REPO_URL }
