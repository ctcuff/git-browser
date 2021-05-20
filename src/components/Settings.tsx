import '../style/settings.scss'
import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { VscGithub } from 'react-icons/vsc'
import { login, logout, loadProfileFromStorage } from '../store/actions/user'
import { setPreferredTheme, setTheme, Theme } from '../store/actions/settings'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from './ModalRoot'
import { State } from '../store'

const mapDispatchToProps = {
  login,
  logout,
  loadProfileFromStorage,
  setTheme,
  showModal,
  setPreferredTheme
}

const mapStateToProps = (state: State) => ({
  isLoggedIn: state.user.isLoggedIn,
  username: state.user.username,
  isLoading: state.user.isLoading
})

const connector = connect(mapStateToProps, mapDispatchToProps)

// Let TypeScript infer the prop types from redux
type SettingsProps = ConnectedProps<typeof connector>

type ProfileInfo = {
  accessToken: string
  username: string
}

const Settings = (props: SettingsProps): JSX.Element => {
  const { isLoggedIn, username, isLoading } = props
  const [currentTheme, setCurrentTheme] = useState<Theme>('theme-auto')

  const onAuthClick = (hasFullAccess: boolean): void => {
    if (isLoggedIn) {
      props.logout()
    } else {
      props.login(hasFullAccess)
    }
  }

  const toggleTheme = (theme: Theme): void => {
    setCurrentTheme(theme)
    props.setTheme(theme)

    if (theme === 'theme-auto') {
      const query = window.matchMedia('(prefers-color-scheme: dark)')
      const preferredTheme = query.matches ? 'theme-dark' : 'theme-light'

      props.setPreferredTheme(preferredTheme)
    }
  }

  const openAccessModal = (): void => {
    props.showModal(ModalTypes.FULL_ACCESS)
  }

  useEffect(() => {
    const userTheme = localStorage.getItem('userTheme')
    const profile = JSON.parse(
      localStorage.getItem('profile') as string
    ) as ProfileInfo | null

    setCurrentTheme((userTheme || currentTheme) as Theme)

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

export default connector(Settings)
