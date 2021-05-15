import Logger from '../../scripts/logger'

const applyTheme = theme => {
  // Query light/dark themes for highlight.js so we can enable/disable
  // stylesheets when the app theme changes
  const lightStyle = document.querySelector('link[title="theme-light"]')
  const darkStyle = document.querySelector('link[title="theme-dark"]')

  document.body.classList.toggle(document.body.className)
  document.body.classList.add(theme)

  switch (theme) {
    case 'theme-light':
      darkStyle.setAttribute('disabled', 'disabled')
      lightStyle.removeAttribute('disabled')
      break
    case 'theme-dark':
      lightStyle.setAttribute('disabled', 'disabled')
      darkStyle.removeAttribute('disabled')
      break
    default:
      Logger.warn('Unknown theme', theme)
  }
}

const setTheme = theme => {
  localStorage.setItem('userTheme', theme)

  if (theme !== 'theme-auto') {
    applyTheme(theme)
  }

  return {
    type: 'SET_THEME',
    payload: {
      userTheme: theme
    }
  }
}

const setPreferredTheme = theme => {
  applyTheme(theme)

  return {
    type: 'SET_PREFERRED_THEME',
    payload: {
      preferredTheme: theme
    }
  }
}

export { setTheme, setPreferredTheme }
