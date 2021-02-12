import URI from 'urijs'
import store from '../store'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from '../components/ModalRoot'

const BASE_API_URL = 'https://api.github.com'
const BASE_REPO_URL = BASE_API_URL + '/repos'

const URLUtil = {
  /**
   * A wrapper around fetch that makes a request to the GitHub API.
   * This rejects if the GitHub rate limit is exceeded.
   *
   * @param {string} url
   * @returns {Promise}
   */
  request(url) {
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
          if (res.headers.get('x-ratelimit-remaining') === '0') {
            reject('rate limit exceeded')
            store.dispatch(showModal(ModalTypes.RATE_LIMIT))
          } else {
            resolve(res)
          }
        })
        .catch(err => reject(err))
    })
  },

  /**
   * @param {string} url
   * @returns {boolean}
   */
  isUrlValid(url) {
    try {
      new URL(this.addScheme(url))
      return true
    } catch (e) {
      return false
    }
  },

  /**
   * @param {string} url
   * @returns {boolean}
   */
  isGithubUrl(url) {
    if (!this.isUrlValid(url)) {
      return false
    }

    const uri = new URI(this.addScheme(url))

    return uri.hostname().toLowerCase() === 'github.com'
  },

  /**
   * Adds `https://` to a url if that or `http://` isn't present
   * @param {string} url
   * @returns {string}
   */
  addScheme(url) {
    if (!url.startsWith('http') || !url.startsWith('https')) {
      return 'https://' + url
    }
    return url
  },

  /**
   * Takes a github url: `https://github.com/user/repo-name`
   * and returns the string `user/repo-name`
   *
   * @param {string} url
   * @returns {string}
   */
  extractRepoPath(url) {
    if (!this.isUrlValid(url)) {
      throw new Error(`Invalid URL: ${url}`)
    }

    const uri = new URI(this.addScheme(url))
    const segments = uri.segment().filter(str => !!str.trim())

    if (segments.length < 2) {
      return null
    }

    return `${segments[0]}/${segments[1]}`
  },

  /**
   * @param {string} repoPath
   * @param {string} branchName
   * @returns {string}
   */
  buildBranchUrl(repoPath, branchName) {
    return `${BASE_REPO_URL}/${repoPath}/git/trees/${branchName}?recursive=true`
  },

  /**
   * @param {string} repoPath
   * @returns {string}
   */
  buildBranchesUrl(repoPath) {
    return `${BASE_REPO_URL}/${repoPath}/branches`
  },

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
  updateURLSearchParams(queryObj) {
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
  },

  /**
   * Takes a key and return the value of that search param from current URL.
   * If defaultValue is present, that's returned instead if `key` isn't found.
   * @param {string} key
   * @param {string} defaultValue
   * @returns {string | any}
   */
  getSearchParam(key, defaultValue = null) {
    const params = new URLSearchParams(window.location.search)
    return params.get(key) || defaultValue
  },

  /**
   * Takes a path name and replaces the current URL path name
   * @param {string} path
   */
  updateURLPath(path) {
    // Adding a leading / to the path replaces the entire URL
    // pathname with `path`
    if (!path.startsWith('/')) {
      path = '/' + path
    }

    window.history.replaceState({}, '', path)
  }
}

export { URLUtil as default, BASE_API_URL, BASE_REPO_URL }
