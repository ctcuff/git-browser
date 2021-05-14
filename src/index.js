import './style/index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Provider } from 'react-redux'
import store from './store'
import ModalRoot from './components/ModalRoot'
import { setPreferredTheme, setTheme } from './store/actions/settings'

if (module.hot) {
  module.hot.accept()
}

const savedTheme = localStorage.getItem('userTheme')
const query = window.matchMedia('(prefers-color-scheme: dark)')

const updateFavicon = query => {
  const link = query.matches ? '/favicon-light.ico' : '/favicon-dark.ico'
  document.querySelector('link[rel="icon"]').setAttribute('href', link)
}

const updatePreferredTheme = query => {
  const theme = query.matches ? 'theme-dark' : 'theme-light'
  store.dispatch(setPreferredTheme(theme))
}

query.addEventListener('change', event => {
  const storedTheme = localStorage.getItem('userTheme')
  updateFavicon(event)

  if (storedTheme === 'theme-auto') {
    updatePreferredTheme(event)
  }
})

updatePreferredTheme(query)
updateFavicon(query)

if (savedTheme) {
  store.dispatch(setTheme(savedTheme))
} else {
  localStorage.setItem('userTheme', 'theme-auto')
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ModalRoot />
    </Provider>
  </React.StrictMode>,
  document.getElementById('app')
)
