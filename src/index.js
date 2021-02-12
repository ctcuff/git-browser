import './style/index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Provider } from 'react-redux'
import store from './store'
import ModalRoot from './components/ModalRoot'
import { setTheme } from './store/actions/settings'

if (module.hot) {
  module.hot.accept()
}

const theme = localStorage.getItem('theme')
const query = window.matchMedia('(prefers-color-scheme: dark)')

const updateFavicon = isDark => {
  const link = isDark ? '/favicon-light.ico' : '/favicon-dark.ico'
  document.querySelector('link[rel="icon"]').setAttribute('href', link)
}

query.addEventListener('change', event => updateFavicon(event.matches))

if (theme) {
  store.dispatch(setTheme(theme))
}

updateFavicon(query.matches)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ModalRoot />
    </Provider>
  </React.StrictMode>,
  document.getElementById('app')
)
