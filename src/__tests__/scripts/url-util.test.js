/* eslint-disable no-import-assign */
import * as config from 'src/config'
import URLUtil from 'src/scripts/url-util'

describe('URLUtil', () => {
  afterEach(() => {
    config.OAUTH_TOKEN = 'mock-token'
  })

  test('request adds oauth token if found', () => {
    global.fetch = jest.fn()
    config.OAUTH_TOKEN = null
    URLUtil.request('test1')

    expect(fetch).toHaveBeenCalledWith(
      'test1',
      expect.objectContaining({
        headers: {}
      })
    )

    config.OAUTH_TOKEN = 'mock-token'
    URLUtil.request('test2')

    expect(fetch).toHaveBeenCalledWith(
      'test2',
      expect.objectContaining({
        headers: {
          Authorization: 'token mock-token'
        }
      })
    )
  })

  test('isUrlValid checks url validity', () => {
    expect(URLUtil.isUrlValid(null)).toBe(false)
    expect(URLUtil.isUrlValid('test.com')).toBe(true)
  })

  test('isGithubUrl checks url validity', () => {
    expect(URLUtil.isGithubUrl(null)).toBe(false)
    expect(URLUtil.isGithubUrl('test.com')).toBe(false)
    expect(URLUtil.isGithubUrl('github.com/user')).toBe(true)
  })

  test('addScheme adds scheme to url if necessary', () => {
    expect(URLUtil.addScheme('test.com')).toBe('https://test.com')
    expect(URLUtil.addScheme('https://test.com')).toBe('https://test.com')
  })

  test('extractRepoPath extracts github path', () => {
    // Need to wrap this in a function so expect won't fail
    expect(() => URLUtil.extractRepoPath('')).toThrowError()
    expect(URLUtil.extractRepoPath('github.com/')).toBe(null)
    expect(URLUtil.extractRepoPath('github.com/user')).toBe(null)
    expect(URLUtil.extractRepoPath('github.com/user/repo')).toBe('user/repo')
    expect(URLUtil.extractRepoPath('github.com//user//repo//')).toBe(
      'user/repo'
    )
    expect(URLUtil.extractRepoPath('github.com///user///repo///')).toBe(
      'user/repo'
    )
  })

  test('buildBranchUrl returns GitHub API branch url', () => {
    expect(URLUtil.buildBranchUrl('user/test-repo', 'master')).toBe(
      'https://api.github.com/repos/user/test-repo/git/trees/master?recursive=true'
    )
  })

  test('buildBranchesUrl returns GitHub API branches url', () => {
    expect(URLUtil.buildBranchesUrl('user/test-repo')).toBe(
      'https://api.github.com/repos/user/test-repo/branches'
    )
  })
})