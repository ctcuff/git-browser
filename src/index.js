import './style/index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Provider } from 'react-redux'
import store from './store'
import PreviewModal from './components/PreviewModal'
import { setTheme } from './store/actions/settings'

if (module.hot) {
  module.hot.accept()
}

const theme = localStorage.getItem('theme')

if (theme) {
  store.dispatch(setTheme(theme))
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <PreviewModal />
    </Provider>
  </React.StrictMode>,
  document.getElementById('app')
)
