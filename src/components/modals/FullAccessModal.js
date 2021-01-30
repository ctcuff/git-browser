import React from 'react'
import BaseModal from './BaseModal'

const modalActions = [
  {
    text: 'Read more',
    onClick: () =>
      window.open(
        'https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes',
        '_blank',
        'noopener,noreferrer'
      )
  }
]

const FullAccessModal = () => (
  <BaseModal title="Full Access" actions={modalActions}>
    <p>
      {`Signing in with GitHub grants read-only access to public repositories. If
      you'd like to view your private repositories, you'll need to grant explicit
      access.`}
    </p>
    <p>
      Don&apos;t worry, this project will only <b>READ</b> from your
      repositories and will <b>NEVER</b> access information other than your
      username!
    </p>
  </BaseModal>
)

export default FullAccessModal
