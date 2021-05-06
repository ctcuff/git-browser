import '../style/landing-screen.scss'
import React from 'react'
import PropTypes from 'prop-types'
import gitBrowserIconDark from '../assets/img/git-browser-icon-dark.svg'
import gitBrowserIconLight from '../assets/img/git-browser-icon-light.svg'
import { connect } from 'react-redux'

const LandingScreen = ({ theme }) => {
  const iconSrc =
    theme === 'theme-light' ? gitBrowserIconLight : gitBrowserIconDark

  return (
    <div className="landing-screen">
      <div className="logo">
        <img src={iconSrc} alt="Git Browser icon" />
      </div>
      <h2 className="heading">Welcome to Git Browser</h2>
      <div className="description">
        <p>To get started, enter a GitHub URL in the search bar.</p>
        <p>
          If you haven&apos;t already, sign in to get access to a higher{' '}
          <a
            href="https://docs.github.com/en/free-pro-team@latest/rest/reference/rate-limit"
            rel="noopener noreferrer"
            target="_blank"
          >
            rate limit.
          </a>
        </p>
      </div>
    </div>
  )
}

LandingScreen.propTypes = {
  theme: PropTypes.oneOf(['theme-dark', 'theme-light', 'theme-auto'])
}

const mapStateToProps = state => ({
  theme: state.settings.theme
})

export default connect(mapStateToProps)(LandingScreen)
