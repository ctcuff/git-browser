import '../style/explorer-panel.scss'
import React from 'react'
import FileExplorer from './FileExplorer'
import Tree from '../scripts/tree'
import Collapse from './Collapse'
import PropTypes from 'prop-types'
import GitHubAPI from '../scripts/github-api'
import SearchInput from './SearchInput'
import BranchList from './BranchList'
import sampleBranchData from '../assets/sample-branches-api-response.json'
import sampleTreeData from '../assets/sample-tree-data.json'

class ExplorerPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedFileName: '',
      selectedFileContents: '',
      treeData: sampleTreeData,
      inputValue: '',
      repoUrl: '',
      currentRepoLoaded: '',
      isFileExplorerOpen: false,
      searchErrorMessage: null,
      isLoading: false,
      branches: sampleBranchData,
      currentBranch: ''
    }

    this.inputRef = React.createRef()

    this.getRepo = this.getRepo.bind(this)
    this.getBranches = this.getBranches.bind(this)
    this.getTree = this.getTree.bind(this)
    this.onBranchClick = this.onBranchClick.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onFileExplorerToggle = this.onFileExplorerToggle.bind(this)
    this.setLoading = this.setLoading.bind(this)
  }

  onInputChange(inputValue) {
    this.setState({ inputValue })
  }

  setLoading(isLoading) {
    this.setState({ isLoading })
  }

  getRepo(url) {
    if (!url || this.state.repoUrl === url) {
      return
    }

    this.setLoading(true)
    this.setState({ searchErrorMessage: null })

    GitHubAPI.getRepo(url)
      .then(async repo => {
        this.setState({ currentBranch: repo.default_branch })

        await this.getTree(repo.defaultBranchUrl)
        await this.getBranches(url)

        this.props.onSearchFinished()
      })
      .catch(searchErrorMessage => {
        this.setState({ searchErrorMessage })
      })
      .finally(() => {
        this.setLoading(false)
      })
  }

  getTree(branchUrl) {
    if (this.state.repoUrl === branchUrl) {
      return Promise.resolve()
    }

    this.setLoading(true)

    return GitHubAPI.getTree(branchUrl)
      .then(tree => {
        this.setState({
          repoUrl: branchUrl,
          treeData: Tree.treeify(tree),
          isFileExplorerOpen: true
        })
      })
      .finally(() => {
        this.setLoading(false)
      })
  }

  getBranches(url) {
    return GitHubAPI.getBranches(url).then(branches => {
      this.setState({ branches })
    })
  }

  onBranchClick(branch) {
    this.setState({ currentBranch: branch.name })
    this.getTree(branch.url)
  }

  onFileExplorerToggle(isOpen) {
    // Update state to make sure the code panel re-opens
    // when a new repo is searched
    this.setState({ isFileExplorerOpen: isOpen })
  }

  render() {
    return (
      <div className="explorer-panel">
        <Collapse title="search" open>
          <SearchInput
            className="search-panel"
            onChange={this.onInputChange}
            onSearch={this.getRepo}
            placeholder="GitHub repo URL"
            hasError={!!this.state.searchErrorMessage}
            errorMessage={this.state.searchErrorMessage}
            isLoading={this.state.isLoading}
            value={this.state.inputValue}
          />
        </Collapse>
        <Collapse
          title="code"
          open={this.state.isFileExplorerOpen}
          onToggle={this.onFileExplorerToggle}
        >
          <FileExplorer
            onSelectFile={this.props.onSelectFile}
            nodes={this.state.treeData}
            repoName={this.state.repoUrl}
          />
        </Collapse>
        <Collapse title="branches">
          <BranchList
            branches={this.state.branches}
            onBranchClick={this.onBranchClick}
            currentBranch={this.state.currentBranch}
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
