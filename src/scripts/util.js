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

// Returns a function, that, as long as it continues to be invoked,
// will not be triggered. The function will be called after it
//stops being called for "wait" milliseconds
const debounce = (func, wait) => {
  let timeout
  return function () {
    const context = this
    const args = arguments

    const later = function () {
      timeout = null
      func.apply(context, args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const getLanguageFromFileName = fileName => {
  const index = fileName.lastIndexOf('.')
  return index === -1 ? 'plaintext' : languageData[fileName.slice(index)]
}

export { parseCSSVar, setCSSVar, debounce, getLanguageFromFileName }
