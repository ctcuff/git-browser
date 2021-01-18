import * as util from 'src/scripts/util'
import monacoLanguages from 'src/assets/monaco-languages-parsed.json'

describe('util', () => {
  test('getLanguageFromFileName returns correct extension', () => {
    const extensions = Object.keys(monacoLanguages)
    const files = extensions.map(ext => ({
      name: ext,
      expected: monacoLanguages[ext]
    }))

    files.forEach(file => {
      expect(util.getLanguageFromFileName(file.name)).toBe(file.expected)
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

    expect(util.parseCSSVar('--does-not-exist')).toBe(0)
    expect(util.parseCSSVar('--height')).toBe(100)
    expect(util.parseCSSVar('--height', mockElement)).toBe(200)
  })

  test('setCSSVar sets CSS variable', () => {
    const root = document.documentElement
    const mockElement = document.createElement('div')

    util.setCSSVar('--theme', 'mock-theme')
    util.setCSSVar('--width', '100px', mockElement)
    util.setCSSVar('--a-number', 100, mockElement)

    expect(getComputedStyle(root).getPropertyValue('--theme')).toBe(
      'mock-theme'
    )
    expect(getComputedStyle(mockElement).getPropertyValue('--width')).toBe(
      '100px'
    )
    expect(getComputedStyle(mockElement).getPropertyValue('--a-number')).toBe(
      '100'
    )
  })

  test('encodes/decodes correctly or throws error', () => {
    const message = 'message √√√'
    const encodedMessage = util.base64EncodeUnicode(message)

    expect(util.base64DecodeUnicode(encodedMessage)).toEqual(message)
    expect(() => {
      util.base64DecodeUnicode('not a base 64 string')
    }).toThrowError()
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
})
