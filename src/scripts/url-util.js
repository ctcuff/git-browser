import URI from 'urijs'
import store from '../store'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from '../components/ModalRoot'
import Logger from './logger'

const BASE_API_URL = 'https://api.github.com'
const BASE_REPO_URL = `${BASE_API_URL}/repos`

class URLUtil {
  /**
   * A wrapper around fetch that makes a request to the GitHub API.
   * This rejects if the GitHub rate limit is exceeded.
   *
   * @param {string} url
   * @returns {Promise}
   */
  static request(url) {
    const oauthToken = store.getState().user.accessToken
    const debugToken = process.env.OAUTH_TOKEN
    const config = {
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
          const rateLimitRemaining = res.headers.get('x-ratelimit-remaining')

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

  /**
   * @param {string} url
   * @returns {boolean}
   */
  static isUrlValid(url) {
    try {
      // eslint-disable-next-line no-new
      new URL(this.addScheme(url))
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  static isGithubUrl(url) {
    if (!this.isUrlValid(url)) {
      return false
    }

    const uri = new URI(this.addScheme(url))

    return uri.hostname().toLowerCase() === 'github.com'
  }

  /**
   * Adds `https://` to a url if that or `http://` isn't present
   * @param {string} url
   * @returns {string}
   */
  static addScheme(url) {
    if (!url.startsWith('http') || !url.startsWith('https')) {
      return `https://${url}`
    }
    return url
  }

  /**
   * Takes a github url: `https://github.com/user/repo-name`
   * and returns the string `user/repo-name`
   *
   * @param {string} url
   * @returns {string}
   */
  static extractRepoPath(url) {
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

  /**
   * @param {string} repoPath
   * @param {string} branchName
   * @returns {string}
   */
  static buildBranchUrl(repoPath, branchName) {
    return `${BASE_REPO_URL}/${repoPath}/git/trees/${branchName}?recursive=true`
  }

  /**
   * @param {string} repoPath
   * @returns {string}
   */
  static buildBranchesUrl(repoPath) {
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
   * returns `?repo=user%2Fname&file=test.css`
   *
   * @param {Object.<string, string?>} queryObj
   * @returns {string}
   */
  static updateURLSearchParams(queryObj) {
    const prevUrl = window.location.pathname + window.location.search
    const searchParams = new URLSearchParams(window.location.search)
    let newUrl = window.location.pathname

    Object.keys(queryObj).forEach(key => {
      if (queryObj[key]) {
        searchParams.set(key, queryObj[key])
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
   * @param {string} key
   * @param {string} defaultValue
   * @returns {string | any}
   */
  static getSearchParam(key, defaultValue = null) {
    const params = new URLSearchParams(window.location.search)
    return params.get(key) ?? defaultValue
  }

  /**
   * Takes a repo path (`user/repo-name`), branch, and file path and returns
   * a URL to view that file on GitHub. If `raw` is `true`, this will return
   * a link similar to clicking the "raw" button on github.
   * @param {Object} params
   * @param {string} params.repoPath
   * @param {string} params.branch
   * @param {string} params.filePath
   * @param {boolean?} params.raw
   * @returns {string}
   */
  buildGithubFileURL(params) {
    const { repoPath, branch, filePath, raw = false } = params

    let URL = `https://github.com/${repoPath}/blob/${branch}/${filePath}`

    if (raw) {
      URL += '?raw=true'
    }

    return URL
  }

  /**
   * Takes a path name and replaces the current URL path name
   * @param {string} path
   */
  static updateURLPath(path) {
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
   * @param {Object} params
   * @param {string} params.repoPath
   * @param {string} params.branch
   * @param {string} params.filePath
   * @param {boolean?} params.raw
   * @returns {string}
   */
  static buildGithubFileURL(params) {
    const { repoPath, branch, filePath, raw = false } = params

    const url = raw
      ? `https://raw.githubusercontent.com/${repoPath}/${branch}/${filePath}`
      : `https://github.com/${repoPath}/blob/${branch}/${filePath}`

    return url
  }

  /**
   * Takes a repo path (`user/repo-name`), branch, and file path and
   * downloads that file from github using the `raw.githubusercontent` URL
   *
   * @param {Object} params
   * @param {string} params.repoPath
   * @param {string} params.branch
   * @param {string} params.filePath
   */
  static downloadGithubFile(params) {
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
