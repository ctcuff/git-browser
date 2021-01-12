import '../style/explorer-panel.scss'
import 'simplebar/dist/simplebar.css'
import React from 'react'
import FileExplorer from './FileExplorer'
import Tree from '../scripts/tree'
import Collapse from './Collapse'
import PropTypes from 'prop-types'
import GitHubAPI from '../scripts/github-api'
import SearchInput from './SearchInput'
import BranchList from './BranchList'
import SimpleBar from 'simplebar-react'
import URLUtil from '../scripts/url-util'
import { AiOutlineLeft, AiOutlineMenu } from 'react-icons/ai'
import Settings from './Settings'
import ResizePanel from './ResizePanel'
import Logger from '../scripts/logger'
import FileSearch from './FileSearch'
import ExplorerPanelOverlay from './ExplorerPanelOverlay'
import {
  AiOutlineSearch,
  AiOutlineFileSearch,
  AiOutlineBranches,
  AiOutlineSetting
} from 'react-icons/ai'
import { VscFiles } from 'react-icons/vsc'

class ExplorerPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      treeData: {},
      inputValue: '',
      currentRepoUrl: '',
      currentBranch: '',
      currentRepoPath: '',
      searchErrorMessage: null,
      isLoading: false,
      isExplorerOpen: window.innerWidth >= 900,
      branches: [],
      isBranchListTruncated: false,
      panels: {
        searchRepo: {
          isOpen: true
        },
        searchFiles: {
          isOpen: false
        },
        code: {
          isOpen: false
        },
        branches: {
          isOpen: false
        },
        settings: {
          isOpen: true
        }
      }
    }

    this.inputRef = React.createRef()

    this.getRepo = this.getRepo.bind(this)
    this.getBranches = this.getBranches.bind(this)
    this.getTree = this.getTree.bind(this)
    this.getBranch = this.getBranch.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.toggleLoading = this.toggleLoading.bind(this)
    this.toggleExplorer = this.toggleExplorer.bind(this)
    this.openExplorer = this.openExplorer.bind(this)
    this.closeExplorer = this.closeExplorer.bind(this)
    this.togglePanel = this.togglePanel.bind(this)
    this.panelButtons = this.panelButtons.bind(this)
    this.updateURLQuery = this.updateURLQuery.bind(this)
  }

  componentDidMount() {
    // Get the repo and branch queries from the URL and make a search
    const params = new URLSearchParams(window.location.search)
    const repo = decodeURIComponent(params.get('repo') || '')
    const branch = decodeURIComponent(params.get('branch') || '')
    const url = 'github.com/' + repo

    if (repo) {
      this.setState({ inputValue: url })
      this.getRepo(url, branch)
    }
  }

  updateURLQuery(query, branch = '') {
    // Appends the ?repo=user/repoName query to the URL
    const prevUrl = window.location.pathname + window.location.search
    let newUrl = `${window.location.pathname}?repo=${encodeURIComponent(query)}`

    if (branch) {
      newUrl += `&branch=${encodeURIComponent(branch)}`
    }

    if (prevUrl !== newUrl) {
      window.history.replaceState({}, '', newUrl)
    }
  }

  onInputChange(inputValue) {
    this.setState({
      inputValue,
      searchErrorMessage: null
    })
  }

  toggleLoading() {
    this.setState({ isLoading: !this.state.isLoading })
  }

  async getRepo(url, branch = 'default') {
    if (
      !url ||
      this.state.currentRepoUrl === url ||
      this.state.currentRepoPath === URLUtil.extractRepoPath(url)
    ) {
      return
    }

    this.props.onSearchStarted()

    this.setState({ searchErrorMessage: null })

    // If we try to load the tree for the repository and it
    // fails, don't try to load the branches
    try {
      await this.getTree(url, branch)
      await this.getBranches(url)

      this.setState({ currentRepoPath: url })
      this.props.onSearchFinished(false)
    } catch (err) {
      this.props.onSearchFinished(true)
    }
  }

  getTree(repoUrl, branch) {
    const { currentRepoUrl, currentBranch } = this.state

    if (
      currentRepoUrl === repoUrl &&
      (currentBranch === branch || currentBranch === 'default')
    ) {
      // Don't search if the repository hasn't changed, or
      // if the branch name hasn't changed
      return Promise.resolve()
    }

    this.toggleLoading()

    return GitHubAPI.getTree(repoUrl, branch)
      .then(res => {
        this.setState({
          treeData: Tree.treeify(res.tree),
          currentBranch: res.branch,
          panels: {
            ...this.state.panels,
            code: {
              isOpen: true
            }
          }
        })

        const path = URLUtil.extractRepoPath(repoUrl)

        this.updateURLQuery(path, res.branch)
      })
      .catch(err => {
        const searchErrorMessage = err.message || err
        this.setState({ searchErrorMessage })
        return Promise.reject(searchErrorMessage)
      })
      .finally(() => {
        this.setState({ currentRepoUrl: repoUrl })
        this.toggleLoading()
      })
  }

  getBranches(repoUrl) {
    return GitHubAPI.getBranches(repoUrl).then(data => {
      this.setState({
        branches: data.branches,
        isBranchListTruncated: data.truncated,
        panels: {
          ...this.state.panels,
          branches: {
            isOpen: true
          }
        }
      })
    })
  }

  getBranch(branch) {
    if (this.state.currentBranch === branch.name) {
      return
    }

    this.props.onSearchStarted()

    this.getTree(branch.repoUrl, branch.name)
      .then(() => this.props.onSearchFinished(false))
      .catch(err => {
        Logger.error(err)
        this.props.onSearchFinished(true)
      })
  }

  toggleExplorer() {
    this.setState({ isExplorerOpen: !this.state.isExplorerOpen })
  }

  openExplorer() {
    this.setState({ isExplorerOpen: true })
  }

  closeExplorer() {
    this.setState({ isExplorerOpen: false })
  }

  togglePanel(panel, isOpen) {
    if (!this.state.panels[panel]) {
      Logger.warn('No panel with name', panel)
      return
    }

    this.setState({
      isExplorerOpen: true,
      panels: {
        ...this.state.panels,
        [panel]: {
          isOpen
        }
      }
    })
  }

  panelButtons() {
    return [
      {
        icon: <AiOutlineSearch />,
        title: 'Search repository',
        onClick: () => this.togglePanel('searchRepo', true)
      },
      {
        icon: <AiOutlineFileSearch />,
        title: 'Search files',
        onClick: () => this.togglePanel('searchFiles', true)
      },
      {
        icon: <VscFiles />,
        title: 'Explorer',
        onClick: () => this.togglePanel('code', true)
      },
      {
        icon: <AiOutlineBranches />,
        title: 'Branches',
        onClick: () => this.togglePanel('branches', true)
      },
      {
        icon: <AiOutlineSetting />,
        title: 'Settings',
        onClick: () => this.togglePanel('settings', true)
      }
    ]
  }

  render() {
    const {
      panels,
      currentRepoUrl,
      currentBranch,
      searchErrorMessage,
      isLoading,
      inputValue,
      treeData,
      branches,
      isExplorerOpen,
      isBranchListTruncated
    } = this.state

    const openClass = isExplorerOpen ? 'is-open' : 'is-closed'

    // Pass a key to the FileExplorer component so that it knows
    // to only render when either the current repository has changed,
    // or when the current branch has changed
    const key = currentRepoUrl + '/' + currentBranch

    return (
      <div className={`explorer-panel ${openClass}`}>
        <ResizePanel
          isExplorerOpen={isExplorerOpen}
          onBreakPointClose={this.closeExplorer}
          onBreakPointOpen={this.openExplorer}
        />
        <button
          className="panel-toggle"
          onClick={this.toggleExplorer}
          title="Toggle Explorer"
        >
          {isExplorerOpen ? (
            <AiOutlineLeft className="panel-toggle-icon" />
          ) : (
            <AiOutlineMenu className="panel-toggle-icon" />
          )}
        </button>
        {!isExplorerOpen && (
          <ExplorerPanelOverlay panelActions={this.panelButtons()} />
        )}
        <SimpleBar className="explorer-panel-content">
          <Collapse
            title="search repo"
            open={panels.searchRepo.isOpen}
            onToggle={() =>
              this.togglePanel('searchRepo', !panels.searchRepo.isOpen)
            }
          >
            <SearchInput
              className="search-panel"
              onChange={this.onInputChange}
              onSearch={this.getRepo}
              placeholder="GitHub repository URL"
              hasError={!!searchErrorMessage}
              errorMessage={searchErrorMessage}
              isLoading={isLoading}
              value={inputValue}
            />
          </Collapse>
          <Collapse
            title="search file"
            open={panels.searchFiles.isOpen}
            onToggle={() =>
              this.togglePanel('searchFiles', !panels.searchFiles.isOpen)
            }
          >
            <FileSearch
              treeData={treeData}
              onSelectFile={this.props.onSelectFile}
            />
          </Collapse>
          <Collapse
            title="code"
            open={panels.code.isOpen}
            onToggle={() => this.togglePanel('code', !panels.code.isOpen)}
          >
            <FileExplorer
              onSelectFile={this.props.onSelectFile}
              nodes={treeData}
              key={key}
            />
          </Collapse>
          <Collapse
            title="branches"
            open={panels.branches.isOpen}
            onToggle={() =>
              this.togglePanel('branches', !panels.branches.isOpen)
            }
          >
            <BranchList
              branches={branches}
              onBranchClick={this.getBranch}
              currentBranch={currentBranch}
              truncated={isBranchListTruncated}
            />
          </Collapse>
          <Collapse
            title="Settings"
            open={panels.settings.isOpen}
            onToggle={() =>
              this.togglePanel('settings', !panels.settings.isOpen)
            }
          >
            <Settings />
          </Collapse>
        </SimpleBar>
      </div>
    )
  }
}

ExplorerPanel.propTypes = {
  onSelectFile: PropTypes.func.isRequired,
  onSearchStarted: PropTypes.func.isRequired,
  onSearchFinished: PropTypes.func.isRequired
}

export default ExplorerPanel
