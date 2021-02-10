import * as util from 'src/scripts/util'
import monacoLanguages from 'src/assets/monaco-languages-parsed.json'
import Logger from 'src/scripts/logger'

describe('util', () => {
  test('getLanguageFromFileName returns correct extension', () => {
    const extensions = Object.keys(monacoLanguages)
    const files = extensions.map(ext => ({
      name: ext,
      expected: monacoLanguages[ext]
    }))

    files.forEach(file => {
      expect(util.getLanguageFromFileName(file.name)).toEqual(file.expected)
    })

    expect(util.getLanguageFromFileName('test-file.pdf')).toEqual({
      language: 'pdf',
      displayName: 'PDF',
      extension: '.pdf'
    })
    expect(util.getLanguageFromFileName('test.file.does-not-exist')).toEqual({
      language: 'plaintext',
      displayName: 'Plain Text',
      extension: '.does-not-exist'
    })
  })

  test('parseCSSVar parses CSS variable to return number', () => {
    const mockElement = document.createElement('div')

    util.setCSSVar('--height', '100px')
    util.setCSSVar('--height', '200px', mockElement)

    expect(util.parseCSSVar('--does-not-exist')).toEqual(0)
    expect(util.parseCSSVar('--height')).toEqual(100)
    expect(util.parseCSSVar('--height', mockElement)).toEqual(200)
  })

  test('setCSSVar sets CSS variable', () => {
    const root = document.documentElement
    const mockElement = document.createElement('div')

    util.setCSSVar('--theme', 'mock-theme')
    util.setCSSVar('--width', '100px', mockElement)
    util.setCSSVar('--a-number', 100, mockElement)

    expect(getComputedStyle(root).getPropertyValue('--theme')).toEqual(
      'mock-theme'
    )
    expect(getComputedStyle(mockElement).getPropertyValue('--width')).toEqual(
      '100px'
    )
    expect(
      getComputedStyle(mockElement).getPropertyValue('--a-number')
    ).toEqual('100')
  })

  test('base64 encodes/decodes correctly or throws error', () => {
    const message = 'message √√√'
    const encodedMessage = util.base64EncodeUnicode(message)

    expect(util.base64DecodeUnicode(encodedMessage)).toEqual(message)
    expect(() => {
      util.base64DecodeUnicode('not a base 64 string')
    }).toThrowError()

    expect(util.base64EncodeUnicode('message', true)).toEqual(btoa('message'))
    expect(util.base64DecodeUnicode('bWVzc2FnZQ==', true)).toEqual(
      atob('bWVzc2FnZQ==')
    )
  })

  test('withClasses builds class string', () => {
    const classes = util.withClasses({
      foo: false,
      bar: 1 + 1 === 2,
      baz: undefined,
      quux: true
    })

    expect(classes).toEqual('bar quux')
  })

  test('copyToClipboard copies value to clipboard', () => {
    const loggerSpy = jest.spyOn(Logger, 'error')

    global.document.execCommand = jest.fn()
    global.navigator.clipboard = null

    util.copyToClipboard('message')

    global.document.execCommand.mockImplementation(() => {
      throw new Error()
    })

    util.copyToClipboard('message')

    global.navigator.clipboard = {
      writeText: jest.fn(() => Promise.resolve())
    }

    util.copyToClipboard('message')

    expect(loggerSpy).toHaveBeenCalled()
    expect(document.execCommand).toHaveBeenCalledTimes(2)
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })
})
