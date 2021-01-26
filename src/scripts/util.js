import languageData from '../assets/monaco-languages-parsed.json'
import Logger from './logger'

/**
 * Takes the name of a CSS var and returns that variable as an integer
 * @param {string} cssVar
 * @param {HTMLElement} element
 * @returns {number}
 */
const parseCSSVar = (cssVar, element = document.documentElement) => {
  const property = getComputedStyle(element).getPropertyValue(cssVar)

  if (!property) {
    Logger.warn(`Property ${cssVar} not found`)
    return 0
  }

  return parseInt(property.trim().replace('px', ''))
}

/**
 * @param {string} key
 * @param {any} value
 * @param {HTMLElement} element
 */
const setCSSVar = (key, value, element = document.documentElement) => {
  element.style.setProperty(key, value)
}

/**
 * Takes the name of a file, extracts the extension, and tries to
 * see if that file extension can be loaded my monaco. If the extension
 * isn't found, plaintext will be returned instead.
 * Ex: `main.js => .js`
 * ```
 * {
 *    "language": "javascript",
 *    "displayName": "JavaScript",
 *    "extension": ".js"
 * }
 * ```
 * @typedef {Object} FileInfo
 * @property {string} language
 * @property {string} displayName
 * @property {string} extension
 *
 * @param {string} fileName
 * @returns {FileInfo}
 */
const getLanguageFromFileName = fileName => {
  if (languageData[fileName]) {
    return languageData[fileName]
  }

  let extension = ''
  fileName = fileName.trim().toLowerCase()

  // Read through the file name backwards to try to read
  // the extension of the file, stopping when we see a `.`
  for (let i = fileName.length - 1; i >= 0; i--) {
    if (fileName[i] === '.') {
      extension += '.'
      break
    }

    extension += fileName[i]
  }

  extension = extension.split('').reverse().join('')

  if (!languageData[extension]) {
    return {
      language: 'plaintext',
      displayName: 'Plain Text',
      extension
    }
  }

  return languageData[extension]
}

/**
 * Properly decodes a base64 string since some non UTF
 * characters may not decode properly using atob. Note that this
 * throws an error if the string can't be decoded. In that case,
 * it may be an image, PDF, or some other file type that
 * FileRenderer might be able to display
 *
 * @param {string} str
 * @param {boolean} raw If true, force decoding with atob
 * @returns {string}
 */
const base64DecodeUnicode = (str, raw = false) => {
  if (raw) {
    return atob(str)
  }

  // https://stackoverflow.com/a/64752311/9124220
  const text = atob(str)
  const length = text.length
  const bytes = new Uint8Array(length)

  for (let i = 0; i < length; i++) {
    bytes[i] = text.charCodeAt(i)
  }

  const decoder = new TextDecoder('utf-8', { fatal: true })

  return decoder.decode(bytes)
}

/**
 * Properly encodes a string since it may contain non UTF characters
 * @param {string} str
 * @param {boolean} raw If true, force encoding with btoa
 * @returns {string}
 */
const base64EncodeUnicode = (str, raw = false) => {
  if (raw) {
    return btoa(str)
  }

  // https://stackoverflow.com/a/43271130/9124220
  const binary = []
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)

  bytes.forEach(byte => binary.push(String.fromCharCode(byte)))

  return btoa(binary.join(''))
}

/**
 * Takes an object of class names and returns a string of only the
 * classes that have keys that evaluate to true.
 *
 * ```
 * withClasses({ foo: true, bar: false, baz: true }) // returns 'foo baz'
 * ```
 *
 * @param {Object.<string, boolean>} classObj
 * @returns {string}
 */
const withClasses = classObj => {
  const classNames = Object.keys(classObj).filter(key => !!classObj[key])
  return classNames.join(' ')
}

/* istanbul ignore next */
const noop = () => {}

export {
  parseCSSVar,
  setCSSVar,
  getLanguageFromFileName,
  noop,
  base64DecodeUnicode,
  base64EncodeUnicode,
  withClasses
}
