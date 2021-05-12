import '../style/settings.scss'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { VscGithub } from 'react-icons/vsc'
import { login, logout, loadProfileFromStorage } from '../store/actions/user'
import { setPreferredTheme, setTheme } from '../store/actions/settings'

const Settings = props => {
  const { isLoggedIn, username, isLoading } = props
  const action = isLoggedIn ? props.logout : props.login
  const [currentTheme, setCurrentTheme] = useState('theme-auto')

  const toggleTheme = theme => {
    setCurrentTheme(theme)
    props.setTheme(theme)

    if (theme === 'theme-auto') {
      const query = window.matchMedia('(prefers-color-scheme: dark)')

      if (query.matches) {
        props.setPreferredTheme('theme-dark')
      } else {
        props.setPreferredTheme('theme-light')
      }
    }
  }

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile'))
    setCurrentTheme(localStorage.getItem('theme'))
    if (profile) {
      props.loadProfileFromStorage({
        accessToken: profile.accessToken,
        username: profile.username
      })
    }
  }, [])

  return (
    <div className="settings">
      <div className="segmented-btn">
        <button
          className={`theme-toggle-btn ${
            currentTheme === 'theme-dark' ? 'selected' : ''
          }`}
          onClick={() => toggleTheme('theme-dark')}
        >
          Dark
        </button>
        <button
          className={`theme-toggle-btn ${
            currentTheme === 'theme-light' ? 'selected' : ''
          }`}
          onClick={() => toggleTheme('theme-light')}
        >
          Light
        </button>
        <button
          className={`theme-toggle-btn ${
            currentTheme === 'theme-auto' ? 'selected' : ''
          }`}
          onClick={() => toggleTheme('theme-auto')}
        >
          Auto
        </button>
      </div>
      <button
        className={`login-btn ${isLoading ? 'is-loading' : ''}`}
        onClick={action}
        disabled={isLoading}
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <React.Fragment>
            {!isLoggedIn && <VscGithub className="github-icon" />}
            {isLoggedIn ? 'Logout' : 'Sign in with GitHub'}
          </React.Fragment>
        )}
      </button>
      {username && <p className="profile-username">Logged in as {username}</p>}
      <a
        className="source-link"
        href="https://github.com/ctcuff/git-browser"
        rel="noopener noreferrer"
        target="_blank"
      >
        View source on GitHub
      </a>
    </div>
  )
}

const mapDispatchToProps = {
  login,
  logout,
  loadProfileFromStorage,
  setTheme,
  setPreferredTheme
}

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  username: state.user.username,
  isLoading: state.user.isLoading,
  rateLimit: state.user.rateLimit,
  theme: state.settings
})

Settings.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  username: PropTypes.string,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadProfileFromStorage: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  setPreferredTheme: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    userTheme: PropTypes.oneOf[('theme-dark', 'theme-light', 'theme-auto')],
    preferredTheme: PropTypes.oneOf[('theme-dark', 'theme-light')]
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
