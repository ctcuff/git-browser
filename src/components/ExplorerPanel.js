import '../style/explorer-panel.scss'
import React from 'react'
import FileExplorer from './FileExplorer'
import Tree from '../scripts/tree'
import Collapse from './Collapse'
import PropTypes from 'prop-types'
import data from '../assets/response.json'
import GitHubAPI from '../scripts/github-api'

class ExplorerPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedFileName: '',
      selectedFileContents: '',
      treeData: data,
      inputValue: '',
      repoName: '',
      isExplorerOpen: false
    }

    this.inputRef = React.createRef()

    this.getRepo = this.getRepo.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
  }

  onInputChange(event) {
    this.setState({ inputValue: event.currentTarget.value })
  }

  getRepo() {
    const inputText = this.state.inputValue

    if (!inputText) {
      return
    }

    this.setState({
      treeData: {},
      repoName: inputText
    })

    GitHubAPI.getTree(inputText)
      .then(res => {
        this.props.onSearchFinished()
        this.setState({
          treeData: Tree.treeify(res.tree),
          isExplorerOpen: true
        })
      })
      .catch(err => console.error(err))
  }

  render() {
    return (
      <div className="explorer-panel">
        <Collapse title="search">
          <div className="search-field">
            <input
              type="text"
              ref={this.inputRef}
              value={this.state.inputValue}
              onChange={this.onInputChange}
            />
            <button onClick={this.getRepo}>Search</button>
          </div>
        </Collapse>
        <Collapse title="code" open={this.state.isExplorerOpen}>
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
