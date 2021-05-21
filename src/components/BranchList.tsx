import '../style/branch-list.scss'
import React, { useState, useEffect } from 'react'
import { AiOutlineBranches } from 'react-icons/ai'
import { GitHubBranch } from '../@types/github-api'

type BranchListProps = {
  branches: Branch[]
  onBranchClick: (branch: Branch) => void
  currentBranch: string
  truncated: boolean
}

const BranchList = (props: BranchListProps): JSX.Element => {
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

export default BranchList
export type Branch = GitHubBranch & { repoUrl: string }
