import * as actions from 'src/store/actions/settings'
import Logger from 'src/scripts/logger'

describe('settings actions', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = /*html*/ `
      <head>
        <link title="theme-light">
        <link title="theme-dark" disabled>
      </head>
      <body class="theme-light"></body>
    `
  })

  test('setTheme creates action to set theme', () => {
    const theme = 'MOCK_THEME'
    expect(actions.setTheme(theme)).toEqual({
      type: 'SET_THEME',
      payload: {
        userTheme: theme
      }
    })
  })

  test('setPreferredTheme creates action to set browser preffered theme', () => {
    const theme = 'MOCK_THEME'
    expect(actions.setPreferredTheme(theme)).toEqual({
      type: 'SET_PREFERRED_THEME',
      payload: {
        preferredTheme: theme
      }
    })
  })

  test('setTheme toggles link elements and body class', () => {
    const lightStyle = document.querySelector('link[title="theme-light"]')
    const darkStyle = document.querySelector('link[title="theme-dark"]')
    const body = document.body
    const loggerSpy = jest.spyOn(Logger, 'warn')

    actions.setTheme('theme-dark')

    expect(lightStyle.getAttribute('disabled')).toEqual('disabled')
    expect(darkStyle.getAttribute('disabled')).toEqual(null)
    expect(body.className).toEqual('theme-dark')
    expect(localStorage.getItem('userTheme')).toEqual('theme-dark')

    actions.setTheme('theme-light')

    expect(lightStyle.getAttribute('disabled')).toEqual(null)
    expect(darkStyle.getAttribute('disabled')).toEqual('disabled')
    expect(body.className).toEqual('theme-light')
    expect(localStorage.getItem('userTheme')).toEqual('theme-light')

    actions.setTheme('theme-auto')

    expect(lightStyle.getAttribute('disabled')).toEqual(null)
    expect(darkStyle.getAttribute('disabled')).toEqual('disabled')
    expect(body.className).toEqual('theme-light')
    expect(localStorage.getItem('userTheme')).toEqual('theme-auto')

    actions.setTheme('invalid-theme')

    expect(loggerSpy).toHaveBeenCalled()
  })
})
