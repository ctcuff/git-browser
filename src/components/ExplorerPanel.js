import '../style/explorer-panel.scss'
import React from 'react'
import FileExplorer from './FileExplorer'
import Tree from '../scripts/tree'
import Collapse from './Collapse'
import PropTypes from 'prop-types'
import GitHubAPI from '../scripts/github-api'
import SearchInput from './SearchInput'
import BranchList from './BranchList'
import sampleBranchData from '../assets/sample-branch-data.json'
import sampleTreeData from '../assets/sample-tree-data.json'

const debugState = {
  treeData: sampleTreeData,
  branches: sampleBranchData,
  currentBranch: 'dev/2020',
  currentRepoUrl: 'github.com/ctcuff/ctcuff.github.io',
  isBranchPanelOpen: true,
  isCodePanelOpen: true,
  inputValue: 'github.com/ctcuff/ctcuff.github.io'
}
class ExplorerPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      treeData: null,
      inputValue: '',
      currentRepoUrl: '',
      currentBranch: '',
      isCodePanelOpen: false,
      isBranchPanelOpen: false,
      searchErrorMessage: null,
      isLoading: false,
      branches: [],
      ...debugState
    }

    this.inputRef = React.createRef()

    this.getRepo = this.getRepo.bind(this)
    this.getBranches = this.getBranches.bind(this)
    this.getTree = this.getTree.bind(this)
    this.getBranch = this.getBranch.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onCodePanelToggle = this.onCodePanelToggle.bind(this)
    this.onBranchPanelToggle = this.onBranchPanelToggle.bind(this)
    this.toggleLoading = this.toggleLoading.bind(this)
  }

  onInputChange(inputValue) {
    this.setState({ inputValue })
  }

  toggleLoading() {
    this.setState({ isLoading: !this.state.isLoading })
  }

  getRepo(url) {
    if (!url || this.state.currentRepoUrl === url) {
      return
    }

    this.setState({ searchErrorMessage: null })
    this.getTree(url, 'default')
    this.getBranches(url)
  }

  getTree(repoUrl, branch) {
    const { currentRepoUrl, currentBranch } = this.state

    if (
      currentRepoUrl === repoUrl &&
      (currentBranch === branch || currentBranch === 'default')
    ) {
      // Don't search if the repository hasn't changed, or
      // if the branch name hasn't changed
      return
    }

    this.toggleLoading()

    GitHubAPI.getTree(repoUrl, branch)
      .then(res => {
        this.props.onSearchFinished()
        this.setState({
          currentRepoUrl: repoUrl,
          treeData: Tree.treeify(res.tree),
          currentBranch: res.branch,
          isCodePanelOpen: true
        })
      })
      .catch(searchErrorMessage => {
        this.setState({ searchErrorMessage })
      })
      .finally(() => {
        this.toggleLoading()
      })
  }

  getBranches(repoUrl) {
    return GitHubAPI.getBranches(repoUrl).then(branches => {
      this.setState({
        branches,
        isBranchPanelOpen: true
      })
    })
  }

  getBranch(branch) {
    this.getTree(branch.repoUrl, branch.name)
  }

  onCodePanelToggle(isCodePanelOpen) {
    this.setState({ isCodePanelOpen })
  }

  onBranchPanelToggle(isBranchPanelOpen) {
    this.setState({ isBranchPanelOpen })
  }

  render() {
    const {
      currentRepoUrl,
      currentBranch,
      searchErrorMessage,
      isLoading,
      inputValue,
      isCodePanelOpen,
      isBranchPanelOpen,
      treeData,
      branches
    } = this.state

    // Pass a key to the FileExplorer component so that it knows
    // to only render when either the current repository has changed,
    // or when the current branch has changed
    const key = currentRepoUrl + '/' + currentBranch

    return (
      <div className="explorer-panel">
        <Collapse title="search" open>
          <SearchInput
            className="search-panel"
            onChange={this.onInputChange}
            onSearch={this.getRepo}
            placeholder="GitHub repo URL"
            hasError={!!searchErrorMessage}
            errorMessage={searchErrorMessage}
            isLoading={isLoading}
            value={inputValue}
          />
        </Collapse>
        <Collapse
          title="code"
          open={isCodePanelOpen}
          onToggle={this.onCodePanelToggle}
        >
          <FileExplorer
            onSelectFile={this.props.onSelectFile}
            nodes={treeData}
            key={key}
          />
        </Collapse>
        <Collapse
          title="branches"
          open={isBranchPanelOpen}
          onToggle={this.onBranchPanelToggle}
        >
          <BranchList
            branches={branches}
            onBranchClick={this.getBranch}
            currentBranch={currentBranch}
          />
        </Collapse>
      </div>
    )
  }
}

ExplorerPanel.propTypes = {
  onSelectFile: PropTypes.func.isRequired,
  onSearchFinished: PropTypes.func.isRequired
}

export default ExplorerPanel
