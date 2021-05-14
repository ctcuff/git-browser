import '../style/branch-list.scss'
import React, { useState, useEffect } from 'react'
import { AiOutlineBranches } from 'react-icons/ai'
import PropTypes from 'prop-types'

const BranchList = props => {
  const [branches, setBranches] = useState(props.branches)
  const [currentBranch, setCurrentBranch] = useState(props.currentBranch)

  useEffect(() => {
    setBranches(props.branches)
  }, [props.branches])

  useEffect(() => {
    setCurrentBranch(props.currentBranch)
  }, [props.currentBranch])

  return (
    <ul className="branch-list">
      {branches.map(branch => (
        <li
          key={branch.name}
          title={branch.name}
          onClick={() => props.onBranchClick(branch)}
          className={branch.name === currentBranch ? 'branch--current' : ''}
        >
          <AiOutlineBranches className="branch-icon" />
          <span className="branch-name">{branch.name}</span>
        </li>
      ))}
      {props.truncated && (
        <li className="truncated-message">
          <small
            className="branch-name"
            title="The GitHub API limits the number of branches we can display."
          >
            Only 100 branches were displayed
          </small>
        </li>
      )}
    </ul>
  )
}

BranchList.propTypes = {
  branches: PropTypes.arrayOf(
    // Matches the shape of the branch object returned by
    // the GitHub API (except repoUrl is a property that
    // was manually added)
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      commit: PropTypes.shape({
        sha: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
      }),
      protected: PropTypes.bool.isRequired,
      repoUrl: PropTypes.string.isRequired
    })
  ),
  onBranchClick: PropTypes.func,
  currentBranch: PropTypes.string,
  truncated: PropTypes.bool
}

BranchList.defaultProps = {
  branches: [],
  onBranchClick: () => {},
  currentBranch: '',
  truncated: false
}

export default BranchList
