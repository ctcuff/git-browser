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
  // This is an extension-less file. Usually, rendering the
  // file as a shell file also handles rendering plaintext
  if (!fileName.includes('.')) {
    return 'shell'
  }

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

  return languageData[extension] || 'plaintext'
}

const noop = () => {}

export { parseCSSVar, setCSSVar, getLanguageFromFileName, noop }
