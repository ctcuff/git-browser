import * as util from 'src/scripts/util'
import monacoLanguages from 'src/assets/monaco-languages-parsed.json'

describe('util', () => {
  test('getLanguageFromFileName returns correct extension', () => {
    const extensions = Object.keys(monacoLanguages)
    const files = extensions.map(ext => ({
      name: 'test-file' + ext,
      expected: monacoLanguages[ext]
    }))

    files.forEach(file => {
      expect(util.getLanguageFromFileName(file.name)).toBe(file.expected)
    })

    // NEed to test the cases where we return early
    expect(util.getLanguageFromFileName('extension-less-file')).toBe('shell')
    expect(util.getLanguageFromFileName('.eslintrc')).toBe('json')
    expect(util.getLanguageFromFileName('file.no-extension-for-this')).toBe('plaintext')
  }),

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

    expect(getComputedStyle(root).getPropertyValue('--theme')).toBe('mock-theme')
    expect(getComputedStyle(mockElement).getPropertyValue('--width')).toBe('100px')
    expect(getComputedStyle(mockElement).getPropertyValue('--a-number')).toBe('100')
  })
})
