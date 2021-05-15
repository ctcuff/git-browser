import store from 'src/store'
import URLUtil from 'src/scripts/url-util'

const defaultResp = {
  statusText: '',
  headers: new Headers({
    'x-ratelimit-remaining': '5000'
  }),
  blob: jest.fn(() => new Blob(['mock-text'])),
  ok: true
}

describe('URLUtil', () => {
  let mockResp

  beforeEach(() => {
    mockResp = { ...defaultResp }
    global.URL.createObjectURL = jest.fn()
  })

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
    mockResp.headers.set('x-ratelimit-remaining', '0')
    global.fetch = jest.fn().mockReturnValue(Promise.resolve(mockResp))

    expect(URLUtil.request('test')).rejects.toEqual(
      new Error('rate limit exceeded')
    )

    global.fetch = jest.fn().mockReturnValue(Promise.reject('mockError'))

    expect(URLUtil.request('test')).rejects.toEqual('mockError')
  })

  test('isUrlValid checks url validity', () => {
    expect(URLUtil.isUrlValid(null)).toEqual(false)
    expect(URLUtil.isUrlValid('test.com')).toEqual(true)
  })

  test('isGithubUrl checks url validity', () => {
    expect(URLUtil.isGithubUrl(null)).toEqual(false)
    expect(URLUtil.isGithubUrl('test.com')).toEqual(false)
    expect(URLUtil.isGithubUrl('github.com/user')).toEqual(true)
  })

  test('addScheme adds scheme to url if necessary', () => {
    expect(URLUtil.addScheme('test.com')).toEqual('https://test.com')
    expect(URLUtil.addScheme('https://test.com')).toEqual('https://test.com')
  })

  test('extractRepoPath extracts github path', () => {
    // Need to wrap this in a function so expect won't fail
    expect(() => URLUtil.extractRepoPath('')).toThrowError()
    expect(URLUtil.extractRepoPath('github.com/')).toEqual(null)
    expect(URLUtil.extractRepoPath('github.com/user')).toEqual(null)
    expect(URLUtil.extractRepoPath('github.com/user/repo')).toEqual('user/repo')
    expect(URLUtil.extractRepoPath('github.com//user//repo//')).toEqual(
      'user/repo'
    )
    expect(URLUtil.extractRepoPath('github.com///user///repo///')).toEqual(
      'user/repo'
    )
  })

  test('buildBranchUrl returns GitHub API branch url', () => {
    expect(URLUtil.buildBranchUrl('user/test-repo', 'master')).toEqual(
      'https://api.github.com/repos/user/test-repo/git/trees/master?recursive=true'
    )
  })

  test('buildBranchesUrl returns GitHub API branches url', () => {
    expect(URLUtil.buildBranchesUrl('user/test-repo')).toEqual(
      'https://api.github.com/repos/user/test-repo/branches'
    )
  })

  test('updateURLSearchParams updates url', () => {
    const spy = jest.spyOn(window.history, 'replaceState')
    URLUtil.updateURLSearchParams({
      foo: 'false',
      bar: 'true',
      baz: undefined,
      quux: 12
    })

    expect(window.location.search).toEqual('?foo=false&bar=true&quux=12')

    URLUtil.updateURLSearchParams({ quux: null })
    URLUtil.updateURLSearchParams({ quux: null })

    expect(window.location.search).toEqual('?foo=false&bar=true')
    // Need to make updateURLSearchParams doesn't replace the URL if the
    // previous URL is equal to the new URL
    expect(spy).toHaveBeenCalledTimes(2)
  })

  test('getSearchParam return search params from current URL', () => {
    URLUtil.updateURLSearchParams({
      foo: 2,
      bar: 'value',
      baz: 'false'
    })

    expect(URLUtil.getSearchParam('foo')).toEqual('2')
    expect(URLUtil.getSearchParam('bar')).toEqual('value')
    expect(URLUtil.getSearchParam('baz')).toEqual('false')

    URLUtil.updateURLSearchParams({ foo: null })

    expect(URLUtil.getSearchParam('foo', 'someDefaultValue')).toEqual(
      'someDefaultValue'
    )
  })

  test('updateURLPath updates URL path name', () => {
    URLUtil.updateURLPath('/some/path')
    expect(window.location.pathname).toEqual('/some/path')

    URLUtil.updateURLPath('some/path')
    expect(window.location.pathname).toEqual('/some/path')
  })

  test('buildGithubFileURL builds correct URL', () => {
    const opts = {
      repoPath: 'user/repo',
      branch: 'main',
      filePath: 'src/test.js'
    }
    const url = URLUtil.buildGithubFileURL(opts)
    const rawUrl = URLUtil.buildGithubFileURL({
      ...opts,
      raw: true
    })

    expect(url).toEqual(`https://github.com/user/repo/blob/main/src/test.js`)
    expect(rawUrl).toEqual(
      `https://raw.githubusercontent.com/user/repo/main/src/test.js`
    )
  })

  test('downloadGithubFile downloads file contents', async () => {
    const spy = jest.spyOn(URL, 'createObjectURL')
    global.fetch = jest.fn().mockReturnValue(Promise.resolve(mockResp))

    await URLUtil.downloadGithubFile({
      repoPath: 'user/repo',
      branch: 'main',
      filePath: 'src/test.js'
    })

    expect(spy).toHaveBeenCalled()
  })

  test('downloadGithubFile handles download error', async () => {
    const urlSpy = jest.spyOn(URL, 'createObjectURL')

    mockResp.ok = false

    global.fetch = jest.fn().mockReturnValue(Promise.resolve(mockResp))

    expect(async () => {
      return await URLUtil.downloadGithubFile({
        repoPath: 'user/repo',
        branch: 'main',
        filePath: 'src/test.js'
      })
    }).rejects.toEqual(new Error('Error downloading file'))

    global.fetch = jest.fn().mockReturnValue(Promise.reject())

    expect(async () => {
      return await URLUtil.downloadGithubFile({
        repoPath: 'user/repo',
        branch: 'main',
        filePath: 'src/test.js'
      })
    }).rejects.toEqual(new Error('Error downloading file'))

    expect(urlSpy).not.toHaveBeenCalled()
  })
})
