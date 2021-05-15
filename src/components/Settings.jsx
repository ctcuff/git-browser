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
      const preferredTheme = query.matches ? 'theme-dark' : 'theme-light'

      props.setPreferredTheme(preferredTheme)
    }
  }

  const openAccessModal = () => {
    props.showModal(ModalTypes.FULL_ACCESS)
  }

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile'))
    setCurrentTheme(localStorage.getItem('userTheme') ?? currentTheme)

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
          type="button"
        >
          Dark
        </button>
        <button
          className={`theme-toggle-btn ${
            currentTheme === 'theme-light' ? 'selected' : ''
          }`}
          onClick={() => toggleTheme('theme-light')}
          type="button"
        >
          Light
        </button>
        <button
          title="Set the theme based on your system"
          className={`theme-toggle-btn ${
            currentTheme === 'theme-auto' ? 'selected' : ''
          }`}
          onClick={() => toggleTheme('theme-auto')}
          type="button"
        >
          Auto
        </button>
      </div>
      <button
        className={`login-btn ${isLoading ? 'is-loading' : ''}`}
        onClick={() => onAuthClick(false)}
        disabled={isLoading}
        type="button"
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <>
            {!isLoggedIn && <VscGithub className="github-icon" />}
            {isLoggedIn ? 'Logout' : 'Sign in with GitHub'}
          </>
        )}
      </button>
      {isLoggedIn || isLoading ? null : (
        <button
          className={`login-btn ${isLoading ? 'is-loading' : ''}`}
          onClick={() => onAuthClick(true)}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              {!isLoggedIn && <VscGithub className="github-icon" />}
              {isLoggedIn ? 'Logout' : 'Sign in with full access'}
            </>
          )}
        </button>
      )}
      {isLoggedIn || isLoading ? null : (
        <p className="source-link" onClick={openAccessModal}>
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

Settings.propTypes = {
  username: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadProfileFromStorage: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  setPreferredTheme: PropTypes.func.isRequired
}

Settings.defaultProps = {
  username: ''
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
  isLoading: state.user.isLoading
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
