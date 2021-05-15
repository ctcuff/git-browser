import React from 'react'
import BaseModal from './BaseModal'

const FileDownloadErrorModal = () => (
  <BaseModal title="Download Error">
    <p>
      {`An error occurred while downloading this file.
      Check your connection and try again`}
    </p>
  </BaseModal>
)

export default FileDownloadErrorModal
