import monacoLanguages from '../assets/monaco-languages-parsed.json'
import Logger from './logger'

type FileInfo = {
  language: string
  displayName: string
  extension: string
}

/**
 * Takes the name of a CSS var and returns that variable as an integer
 */
const parseCSSVar = (
  cssVar: string,
  element: HTMLElement = document.documentElement
): number => {
  const property = getComputedStyle(element).getPropertyValue(cssVar)

  if (!property) {
    Logger.warn(`Property ${cssVar} not found`)
    return 0
  }

  return parseInt(property.trim().replace('px', ''), 10)
}

const setCSSVar = (
  key: string,
  value: string,
  element: HTMLElement = document.documentElement
): void => {
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
 */
const getLanguageFromFileName = (fileName: string): FileInfo => {
  const languageData = monacoLanguages as { [key: string]: FileInfo }

  if (languageData[fileName]) {
    return languageData[fileName]
  }

  const sanitizedFileName = fileName.trim().toLowerCase()
  let extension = ''

  // Read through the file name backwards to try to read
  // the extension of the file, stopping when we see a `.`
  for (let i = sanitizedFileName.length - 1; i >= 0; i--) {
    if (sanitizedFileName[i] === '.') {
      extension += '.'
      break
    }

    extension += sanitizedFileName[i]
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
 * @param raw If true, force decoding with atob
 */
const base64DecodeUnicode = (str: string, raw = false): string => {
  if (raw) {
    return atob(str)
  }

  // https://stackoverflow.com/a/64752311/9124220
  const text = atob(str)
  const bytes = new Uint8Array(text.length)

  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i)
  }

  const decoder = new TextDecoder('utf-8', { fatal: true })

  return decoder.decode(bytes)
}

/**
 * Properly encodes a string since it may contain non UTF characters
 *
 * @param raw If true, force encoding with btoa
 */
const base64EncodeUnicode = (str: string, raw = false): string => {
  if (raw) {
    return btoa(str)
  }

  // https://stackoverflow.com/a/43271130/9124220
  const binary: string[] = []
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
 */
const withClasses = (classObj: { [key: string]: boolean }): string => {
  const classNames = Object.keys(classObj).filter(key => !!classObj[key])
  return classNames.join(' ')
}

const copyToClipboard = (text: string): void => {
  // Fallback if navigator.clipboard isn't available
  if (!navigator.clipboard) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
    } catch (err) {
      Logger.error('Fallback: unable to copy', err)
    }

    document.body.removeChild(textArea)
    return
  }

  navigator.clipboard.writeText(text).catch(err => Logger.error(err))
}

export {
  parseCSSVar,
  setCSSVar,
  getLanguageFromFileName,
  base64DecodeUnicode,
  base64EncodeUnicode,
  withClasses,
  copyToClipboard
}
