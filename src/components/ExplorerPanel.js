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
          isOpen: true,
          ref: React.createRef()
        },
        searchFiles: {
          isOpen: false,
          ref: React.createRef()
        },
        code: {
          isOpen: false,
          ref: React.createRef()
        },
        branches: {
          isOpen: false,
          ref: React.createRef()
        },
        settings: {
          isOpen: true,
          ref: React.createRef()
        }
      }
    }

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
    this.scrollToPanel = this.scrollToPanel.bind(this)
  }

  componentDidMount() {
    // Get the repo and branch queries from the URL and make a search
    const repo = URLUtil.getSearchParam('repo')
    const branch = URLUtil.getSearchParam('branch', 'default')
    const url = 'github.com/' + repo

    if (repo) {
      this.setState({ inputValue: url })
      this.getRepo(url, branch)
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
              ...this.state.panels.code,
              isOpen: true
            }
          }
        })

        URLUtil.updateURLSearchParams({
          repo: URLUtil.extractRepoPath(repoUrl),
          branch
        })
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
            ...this.state.panels.branches,
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

  togglePanel(panel, isOpen, scrollIntoView = false) {
    if (!this.state.panels[panel]) {
      Logger.warn('No panel with name', panel)
      return
    }

    this.setState(
      {
        isExplorerOpen: true,
        panels: {
          ...this.state.panels,
          [panel]: {
            ...this.state.panels[panel],
            isOpen
          }
        }
      },
      () => {
        if (scrollIntoView) {
          this.scrollToPanel(panel)
        }
      }
    )
  }

  scrollToPanel(panelName) {
    const panel = this.state.panels[panelName].ref.current
    if (panel) {
      panel.scrollIntoView()
    }
  }

  panelButtons() {
    return [
      {
        icon: <AiOutlineSearch />,
        title: 'Search repository',
        onClick: () => this.togglePanel('searchRepo', true, true)
      },
      {
        icon: <AiOutlineFileSearch />,
        title: 'Search files',
        onClick: () => this.togglePanel('searchFiles', true, true)
      },
      {
        icon: <VscFiles />,
        title: 'Explorer',
        onClick: () => this.togglePanel('code', true, true)
      },
      {
        icon: <AiOutlineBranches />,
        title: 'Branches',
        onClick: () => this.togglePanel('branches', true, true)
      },
      {
        icon: <AiOutlineSetting />,
        title: 'Settings',
        onClick: () => this.togglePanel('settings', true, true)
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
            ref={panels.searchRepo.ref}
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
            ref={panels.searchFiles.ref}
            onToggle={() =>
              this.togglePanel('searchFiles', !panels.searchFiles.isOpen)
            }
          >
            <FileSearch
              treeData={treeData}
              onSelectFile={this.props.onSelectFile}
              activeFilePath={this.props.activeFilePath}
            />
          </Collapse>
          <Collapse
            title="code"
            open={panels.code.isOpen}
            ref={panels.code.ref}
            onToggle={() => this.togglePanel('code', !panels.code.isOpen)}
          >
            <FileExplorer
              key={key}
              nodes={treeData}
              onSelectFile={this.props.onSelectFile}
              activeFilePath={
                // Pass an empty string when closed to prevent the explorer
                // from unnecessarily searching for the active file
                isExplorerOpen && panels.code.isOpen
                  ? this.props.activeFilePath
                  : ''
              }
            />
          </Collapse>
          <Collapse
            title="branches"
            open={panels.branches.isOpen}
            ref={panels.branches.ref}
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
            ref={panels.settings.ref}
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
  onSearchFinished: PropTypes.func.isRequired,
  activeFilePath: PropTypes.string.isRequired
}

export default ExplorerPanel
