import { OAUTH_TOKEN } from '../config'
import URI from 'urijs'

const BASE_API_URL = 'https://api.github.com'
const BASE_REPO_URL = BASE_API_URL + '/repos'

const URLUtil = {
  request(url) {
    const config = {
      headers: {}
    }

    if (OAUTH_TOKEN) {
      config.headers.Authorization = `token ${OAUTH_TOKEN}`
    }

    return fetch(url, config)
  },

  isUrlValid(url) {
    try {
      new URL(this.addScheme(url))
      return true
    } catch (e) {
      return false
    }
  },

  isGithubUrl(url) {
    if (!this.isUrlValid(url)) {
      return false
    }

    const uri = new URI(this.addScheme(url))

    return uri.hostname().toLowerCase() === 'github.com'
  },

  addScheme(url) {
    if (!url.startsWith('http') || !url.startsWith('https')) {
      return 'https://' + url
    }
    return url
  },

  /**
   * Takes a github url: 'https://github.com/user/repo-name'
   * and returns the string `user/repo-name`
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

  buildBranchUrl(repoPath, branchName) {
    return `${BASE_REPO_URL}/${repoPath}/git/trees/${branchName}?recursive=true`
  },

  buildBranchesUrl(repoPath) {
    return `${BASE_REPO_URL}/${repoPath}/branches`
  }
}

export { URLUtil as default, BASE_API_URL, BASE_REPO_URL }
