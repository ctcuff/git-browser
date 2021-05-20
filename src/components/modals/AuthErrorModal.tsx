import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import BaseModal from './BaseModal'
import { hideModal } from '../../store/actions/modal'

const mapDispatchToProps = {
  hideModal
}

const connector = connect(null, mapDispatchToProps)

type AuthErrorModalProps = ConnectedProps<typeof connector> & {
  code: string
}

const AuthErrorModal = (props: AuthErrorModalProps): JSX.Element | null => {
  let message = ''

  switch (props.code) {
    // Ignore errors that aren't related to the auth process
    case 'auth/user-cancelled':
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      // Need to make sure the modal state gets reset
      setTimeout(props.hideModal, 100)
      return null
    case 'auth/network-request-failed':
      message = `A network error occurred while signing in.
      Check your connection and try again later.`
      break
    case 'auth/too-many-requests':
      message = `Looks like you've made too many log in attempts. Take a break
      and try again in a few minutes.`
      break
    default:
      message =
        'An unknown error occurred while signing in. Please try again later.'
  }

  return (
    <BaseModal title="Authentication Error">
      <p>{message}</p>
    </BaseModal>
  )
}

const ConnectedAuthErrorModal = connector(AuthErrorModal)

export default ConnectedAuthErrorModal
