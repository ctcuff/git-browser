import '../style/settings.scss'
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { VscGithub } from 'react-icons/vsc'
import {
  login,
  logout,
  updateRateLimit,
  authenticate
} from '../store/actions/user'
import { setTheme } from '../store/actions/settings'

const Settings = props => {
  const { isLoggedIn, username, isLoading, rateLimit } = props
  const action = isLoggedIn ? props.logout : props.login

  const toggleTheme = () => {
    const isDark = document.body.className === 'theme-dark'
    const theme = isDark ? 'theme-light' : 'theme-dark'

    props.setTheme(theme)
  }

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile'))

    if (profile) {
      props.authenticate({
        accessToken: profile.accessToken,
        avatarUrl: profile.avatarUrl,
        username: profile.username
      })
    }

    props.updateRateLimit()
  }, [])

  return (
    <div className="settings">
      {rateLimit.reset && (
        <div className="profile-info">
          <p>
            Rate limit: {rateLimit.remaining}/{rateLimit.limit}
          </p>
          <p>Next reset: {new Date(rateLimit.reset).toLocaleString()}</p>
          {username && <p>Logged in as {username}</p>}
        </div>
      )}
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
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        Toggle theme
      </button>
    </div>
  )
}

const mapDispatchToProps = {
  login,
  logout,
  updateRateLimit,
  authenticate,
  setTheme
}

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  username: state.user.username,
  isLoading: state.user.isLoading,
  rateLimit: state.user.rateLimit
})

Settings.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  username: PropTypes.string,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  updateRateLimit: PropTypes.func.isRequired,
  authenticate: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  rateLimit: PropTypes.shape({
    remaining: PropTypes.number,
    limit: PropTypes.number,
    reset: PropTypes.number
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
