import '../style/settings.scss'
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { VscGithub } from 'react-icons/vsc'
import { login, logout, loadProfileFromStorage } from '../store/actions/user'
import { setTheme } from '../store/actions/settings'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from './ModalRoot'

const Settings = props => {
  const { isLoggedIn, username, isLoading } = props
  const onAuthClick = hasFullAccess => {
    if (isLoggedIn) {
      props.logout()
    } else {
      props.login(hasFullAccess)
    }
  }

  const toggleTheme = () => {
    const isDark = document.body.className === 'theme-dark'
    const theme = isDark ? 'theme-light' : 'theme-dark'

    props.setTheme(theme)
  }

  const openAccessModal = () => {
    props.showModal(ModalTypes.FULL_ACCESS)
  }

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile'))

    if (profile) {
      props.loadProfileFromStorage({
        accessToken: profile.accessToken,
        username: profile.username
      })
    }
  }, [])

  return (
    <div className="settings">
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {props.theme === 'theme-dark' ? 'Light mode' : 'Dark mode'}
      </button>
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
  showModal
}

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  username: state.user.username,
  isLoading: state.user.isLoading,
  rateLimit: state.user.rateLimit,
  theme: state.settings.theme
})

Settings.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  username: PropTypes.string,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadProfileFromStorage: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['theme-dark', 'theme-light']).isRequired,
  showModal: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
