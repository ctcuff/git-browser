import '../style/settings.scss'
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { VscGithub } from 'react-icons/vsc'
import { login, logout, loadProfileFromStorage } from '../store/actions/user'
import { setTheme } from '../store/actions/settings'

const Settings = props => {
  let timeoutId = null
  const { isLoggedIn, username, isLoading } = props
  const action = isLoggedIn ? props.logout : props.login

  const toggleTheme = () => {
    const isDark = document.body.className === 'theme-dark'
    const theme = isDark ? 'theme-light' : 'theme-dark'
    document.documentElement.classList.add('is-transitioning')

    props.setTheme(theme)

    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      document.documentElement.classList.remove('is-transitioning')
    }, 1000)
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
    </div>
  )
}

const mapDispatchToProps = {
  login,
  logout,
  loadProfileFromStorage,
  setTheme
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
  theme: PropTypes.oneOf(['theme-dark', 'theme-light']).isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
