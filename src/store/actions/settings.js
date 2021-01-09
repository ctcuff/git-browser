import Logger from '../../scripts/logger'

const setTheme = theme => {
  // Query light/dark themes for highlight.js so we can enable/disable
  // stylesheets when the app theme changes
  const lightStyle = document.querySelector('link[title="theme-light"]')
  const darkStyle = document.querySelector('link[title="theme-dark"]')
  const body = document.body

  localStorage.setItem('theme', theme)

  body.classList.toggle(body.className)
  body.classList.add(theme)

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

  return {
    type: 'SET_THEME',
    payload: {
      theme
    }
  }
}

export { setTheme }
