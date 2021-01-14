import store from 'src/store'
import URLUtil from 'src/scripts/url-util'

const mockResp = {
  statusText: ''
}

describe('URLUtil', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('request adds oauth token if found', async () => {
    const mockStore = jest.spyOn(store, 'getState')
    global.fetch = jest.fn().mockReturnValue(Promise.resolve(mockResp))

    const res = await URLUtil.request('test1')

    expect(fetch).toHaveBeenCalledWith(
      'test1',
      expect.objectContaining({
        headers: {}
      })
    )

    expect(res).toEqual(mockResp)

    process.env.DEBUG = 'true'
    process.env.OAUTH_TOKEN = 'mock-token'
    URLUtil.request('test2')

    expect(fetch).toHaveBeenCalledWith(
      'test2',
      expect.objectContaining({
        headers: {
          Authorization: 'token mock-token'
        }
      })
    )

    process.env.DEBUG = ''
    process.env.OAUTH_TOKEN = ''
    mockStore.mockReturnValue({
      user: {
        accessToken: 'mock-user-token'
      }
    })

    URLUtil.request('test3')

    expect(fetch).toHaveBeenCalledWith(
      'test3',
      expect.objectContaining({
        headers: {
          Authorization: 'token mock-user-token'
        }
      })
    )
  })

  test('request handles rate limit and other errors', async () => {
    mockResp.statusText = 'some rate limit error'
    global.fetch = jest.fn().mockReturnValue(Promise.resolve(mockResp))

    expect(URLUtil.request('test')).rejects.toEqual('Rate limit exceeded')

    global.fetch = jest.fn().mockReturnValue(Promise.reject('mockError'))

    expect(URLUtil.request('test')).rejects.toEqual('mockError')
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
