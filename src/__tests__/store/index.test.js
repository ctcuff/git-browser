describe('store', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('adds dev extension when in debug mode', () => {
    process.env.DEBUG = 'true'
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn()

    require('src/store')

    expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalled()
  })

  test('removes dev extension when not in debug mode', () => {
    process.env.DEBUG = ''
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn()

    require('src/store')

    expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).not.toHaveBeenCalled()
  })
})
