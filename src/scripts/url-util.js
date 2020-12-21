import { OAUTH_TOKEN } from '../config'

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

    const { hostname } = new URL(this.addScheme(url))
    return hostname.toLowerCase() === 'github.com'
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

    const parsedUrl = new URL(this.addScheme(url))

    if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
      return null
    }

    let path = parsedUrl.pathname

    // Removes all leading `/`
    while (path.startsWith('/')) {
      path = path.slice(1)
    }

    // Removes all trailing `/`
    while (path.endsWith('/')) {
      path = path.slice(0, path.length - 1)
    }

    // Replaces any repeating `/` between the path
    path = path.replace(/\/+/g, '/')

    // This happens if the url was originally github.com/user,
    // there was no repo specified
    if (!path.includes('/')) {
      return null
    }

    return path
  },

  buildBranchUrl(repoPath, branchName) {
    return `${BASE_REPO_URL}/${repoPath}/git/trees/${branchName}?recursive=true`
  },

  buildBranchesUrl(repoPath) {
    return `${BASE_REPO_URL}/${repoPath}/branches`
  }
}

export { URLUtil as default, BASE_API_URL, BASE_REPO_URL }
