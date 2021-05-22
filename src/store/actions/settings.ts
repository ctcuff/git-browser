import Logger from '../../scripts/logger'

const applyTheme = (theme: Omit<Theme, 'theme-auto'>): void => {
  // Query light/dark themes for highlight.js so we can enable/disable
  // stylesheets when the app theme changes
  const lightStyle = document.querySelector('link[title="theme-light"]')
  const darkStyle = document.querySelector('link[title="theme-dark"]')

  if (!lightStyle || !darkStyle) {
    Logger.error('Invalid selector for link')
    return
  }

  document.body.classList.toggle(document.body.className)
  document.body.classList.add(theme as string)

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

const setTheme = (theme: Theme): SetThemeAction => {
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

const setPreferredTheme = (theme: Theme): SetPreferredThemeAction => {
  applyTheme(theme)

  return {
    type: 'SET_PREFERRED_THEME',
    payload: {
      preferredTheme: theme
    }
  }
}

type SetThemeAction = {
  type: 'SET_THEME'
  payload: {
    userTheme: Theme
  }
}

type SetPreferredThemeAction = {
  type: 'SET_PREFERRED_THEME'
  payload: {
    preferredTheme: Theme
  }
}

export { setTheme, setPreferredTheme }
export type SettingsAction = SetThemeAction | SetPreferredThemeAction
export type Theme = 'theme-light' | 'theme-dark' | 'theme-auto'
