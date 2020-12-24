import languageData from '../assets/monaco-languages-parsed.json'

const parseCSSVar = (cssVar, element = document.documentElement) => {
  const property = getComputedStyle(element).getPropertyValue(cssVar)

  if (!property) {
    console.warn(`Property ${cssVar} not found`)
    return 0
  }

  return parseInt(property.trim().replace('px', ''))
}

const setCSSVar = (key, value, element = document.documentElement) => {
  element.style.setProperty(key, value)
}

const getLanguageFromFileName = fileName => {
  if (languageData[fileName]) {
    return languageData[fileName]
  }

  let extension = ''
  fileName = fileName.trim()

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

  const registeredLanguage = getRegisteredLanguage(extension)

  if (registeredLanguage) {
    return JSON.parse(registeredLanguage)
  }

  // We've found the extension but it isn't supported by monaco
  if (!languageData[extension]) {
    return {
      language: '',
      displayName: '',
      canEditorRender: false,
      extension
    }
  }

  return languageData[extension]
}

const registerLanguage = extension => {
  // Saves this extension to local storage so we don't have
  // to display a warning every time this file type is opened
  localStorage.setItem(
    extension,
    JSON.stringify({
      language: 'plaintext',
      displayName: 'Plain Text',
      canEditorRender: true,
      extension
    })
  )
}

const getRegisteredLanguage = extension => {
  return localStorage.getItem(extension)
}

/* istanbul ignore next */
const noop = () => {}

export {
  parseCSSVar,
  setCSSVar,
  getLanguageFromFileName,
  noop,
  registerLanguage
}
