import '../style/settings.scss'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { VscGithub } from 'react-icons/vsc'
import { login, logout, loadProfileFromStorage } from '../store/actions/user'
import { setPreferredTheme, setTheme } from '../store/actions/settings'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from './ModalRoot'

const Settings = props => {
  const { isLoggedIn, username, isLoading } = props
  const [currentTheme, setCurrentTheme] = useState('theme-auto')

  const onAuthClick = hasFullAccess => {
    if (isLoggedIn) {
      props.logout()
    } else {
      props.login(hasFullAccess)
    }
  }

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

  const openAccessModal = () => {
    props.showModal(ModalTypes.FULL_ACCESS)
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
        onClick={onAuthClick.bind(this, false)}
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
      {isLoggedIn || isLoading ? null : (
        <button
          className={`login-btn ${isLoading ? 'is-loading' : ''}`}
          onClick={onAuthClick.bind(this, true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <React.Fragment>
              {!isLoggedIn && <VscGithub className="github-icon" />}
              {isLoggedIn ? 'Logout' : 'Sign in with full access'}
            </React.Fragment>
          )}
        </button>
      )}
      {isLoggedIn || isLoading ? null : (
        <p className="source-link" onClick={openAccessModal.bind(this)}>
          What is this?
        </p>
      )}
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
  showModal,
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
  showModal: PropTypes.func.isRequired,
  setPreferredTheme: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    userTheme: PropTypes.oneOf[('theme-dark', 'theme-light', 'theme-auto')],
    preferredTheme: PropTypes.oneOf[('theme-dark', 'theme-light')]
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
