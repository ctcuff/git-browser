import React from 'react'
import BaseModal from './BaseModal'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { hideModal } from '../../store/actions/modal'

const AuthErrorModal = props => {
  let message

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

AuthErrorModal.propTypes = {
  code: PropTypes.string,
  hideModal: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  hideModal
}

export default connect(null, mapDispatchToProps)(AuthErrorModal)
