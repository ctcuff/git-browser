describe('Logger', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('writes messages in debug mode', () => {
    process.env.DEBUG = 'true'

    const Logger = require('src/scripts/logger').default
    const log = jest.spyOn(console, 'log')
    const warn = jest.spyOn(console, 'warn')
    const error = jest.spyOn(console, 'error')
    const args = ['test', 1, true, [3]]

    Logger.info(...args)
    Logger.warn(...args)
    Logger.error(...args)

    expect(log).toHaveBeenCalledWith(...args)
    expect(warn).toHaveBeenCalledWith('WARNING:', ...args)
    expect(error).toHaveBeenCalledWith('ERROR:', ...args)
  })

  test('does not write messages if not in debug mode', () => {
    process.env.DEBUG = ''

    const Logger = require('src/scripts/logger').default
    const log = jest.spyOn(console, 'log')
    const warn = jest.spyOn(console, 'warn')
    const error = jest.spyOn(console, 'error')
    const args = ['test', 1, true, [3]]

    Logger.info(...args)
    Logger.warn(...args)
    Logger.error(...args)

    expect(log).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })
})
