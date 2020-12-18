import '../style/explorer-panel.scss'
import React from 'react'
import FileExplorer from './FileExplorer'
import Tree from '../scripts/tree'
import Collapse from './Collapse'
import PropTypes from 'prop-types'
import data from '../assets/response.json'
import GitHubAPI from '../scripts/github-api'
import SearchInput from './SearchInput'

class ExplorerPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedFileName: '',
      selectedFileContents: '',
      treeData: data,
      inputValue: '',
      repoName: '',
      isFileExplorerOpen: false,
      searchErrorMessage: null,
      isLoading: false
    }

    this.inputRef = React.createRef()

    this.getRepo = this.getRepo.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onFileExplorerToggle = this.onFileExplorerToggle.bind(this)
    this.toggleLoading = this.toggleLoading.bind(this)
  }

  onInputChange(inputValue) {
    this.setState({ inputValue })
  }

  toggleLoading() {
    this.setState({ isLoading: !this.state.isLoading })
  }

  getRepo(inputValue) {
    if (!inputValue) {
      return
    }

    this.toggleLoading()

    this.setState({
      treeData: {},
      repoName: inputValue,
      searchErrorMessage: null,
      isLoading: true
    })

    GitHubAPI.getTree(inputValue)
      .then(res => {
        this.setState({
          treeData: Tree.treeify(res.tree),
          isFileExplorerOpen: true
        })
      })
      .catch(searchErrorMessage => {
        this.setState({ searchErrorMessage })
      })
      .finally(() => {
        this.props.onSearchFinished()
        this.toggleLoading()
      })
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
            repoName={this.state.repoName}
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
