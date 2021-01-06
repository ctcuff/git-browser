import React from 'react'
import BaseModal from './BaseModal'

const RateLimitModal = () => (
  <BaseModal title="Rate Limit Exceeded">
    <p>
      {`Woah there, slow down! Looks like you've reached GitHub's rate limit.
          But there's good news: authenticated users get much higher rate limit!`}
    </p>
  </BaseModal>
)

export default RateLimitModal
