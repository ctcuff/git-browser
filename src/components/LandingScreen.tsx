import '../style/landing-screen.scss'
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import gitBrowserIconDark from '../assets/img/git-browser-icon-dark.svg'
import gitBrowserIconLight from '../assets/img/git-browser-icon-light.svg'
import { State } from '../store'

const mapStateToProps = (state: State) => ({
  theme: state.settings.theme
})

const connector = connect(mapStateToProps)

type LandingScreenProps = ConnectedProps<typeof connector>

const LandingScreen = ({ theme }: LandingScreenProps): JSX.Element => {
  let iconSrc = ''

  switch (theme.userTheme) {
    case 'theme-light':
      iconSrc = gitBrowserIconLight
      break
    case 'theme-dark':
      iconSrc = gitBrowserIconDark
      break
    case 'theme-auto':
      iconSrc =
        theme.preferredTheme === 'theme-light'
          ? gitBrowserIconLight
          : gitBrowserIconDark
      break
    default:
      iconSrc = gitBrowserIconDark
  }

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

const ConnectedLandingScreen = connector(LandingScreen)

export default ConnectedLandingScreen
