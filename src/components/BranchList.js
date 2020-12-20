import '../style/branch-list.scss'
import React, { useState, useEffect } from 'react'
import { AiOutlineBranches } from 'react-icons/ai'
import PropTypes from 'prop-types'
import { noop } from '../scripts/util'

const BranchList = props => {
  const [branches, setBranches] = useState(props.branches)
  const [currentBranch, setCurrentBranch] = useState(props.currentBranch)

  useEffect(() => setBranches(props.branches), [props.branches])
  useEffect(() => setCurrentBranch(props.currentBranch), [props.currentBranch])

  return (
    <ul className="branch-list">
      {branches.map(branch => (
        <li
          key={branch.name}
          title={branch.name}
          onClick={() => props.onBranchClick(branch)}
          className={branch.name === currentBranch ? 'branch--current' : null}
        >
          <AiOutlineBranches className="branch-icon" />
          <span className="branch-name">{branch.name}</span>
        </li>
      ))}
    </ul>
  )
}

BranchList.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      // Matches the shape of the branch object returned by
      // the GitHub API (except repoUrl is a property that
      // was manually added)
      name: PropTypes.string.isRequired,
      commit: PropTypes.shape({
        sha: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
      }),
      protected: PropTypes.bool.isRequired,
      repoUrl: PropTypes.string.isRequired,
    })
  ),
  onBranchClick: PropTypes.func,
  currentBranch: PropTypes.string
}

BranchList.defaultProps = {
  onBranchClick: noop
}

export default BranchList