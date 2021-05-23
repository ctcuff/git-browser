// eslint-disable-next-line import/no-extraneous-dependencies
import 'simplebar/dist/simplebar.css'
import '../style/explorer-panel.scss'
import SimpleBar from 'simplebar-react'
import React from 'react'
import {
  AiOutlineSearch,
  AiOutlineFileSearch,
  AiOutlineBranches,
  AiOutlineSetting,
  AiOutlineLeft,
  AiOutlineMenu
} from 'react-icons/ai'
import { connect, ConnectedProps } from 'react-redux'
import { VscFiles } from 'react-icons/vsc'
import FileExplorer from './FileExplorer'
import Tree, { TreeNodeObject } from '../scripts/tree'
import Collapse from './Collapse'
import GitHubAPI from '../scripts/github-api'
import SearchInput from './SearchInput'
import BranchList, { Branch } from './BranchList'
import URLUtil from '../scripts/url-util'
import Settings from './Settings'
import ResizePanel from './ResizePanel'
import Logger from '../scripts/logger'
import FileSearch from './FileSearch'
import ExplorerPanelOverlay, { PanelAction } from './ExplorerPanelOverlay'
import { setRepoData } from '../store/actions/search'
import { BranchListResponse } from '../@types/github-api'

const mapDispatchToProps = {
  setRepoData
}

const connector = connect(null, mapDispatchToProps)

type Panel = {
  isOpen: boolean
  ref: React.RefObject<HTMLDivElement>
}

type ExplorerPanelProps = ConnectedProps<typeof connector> & {
  onSelectFile: (file: TreeNodeObject) => void
  onSearchStarted: () => void
  onSearchFinished: (hasError: boolean) => void
  activeFilePath: string
}

type ExplorerPanelState = {
  treeData: { [key: string]: TreeNodeObject }
  inputValue: string
  currentRepoUrl: string
  currentBranch: string
  searchErrorMessage: string
  isLoading: boolean
  isExplorerOpen: boolean
  branches: BranchListResponse['data']
  isBranchListTruncated: boolean
  panels: {
    [key: string]: Panel
  }
}

class ExplorerPanel extends React.Component<
  ExplorerPanelProps,
  ExplorerPanelState
> {
  private mountedWithFile = false

  constructor(props: ExplorerPanelProps) {
    super(props)

    this.state = {
      treeData: {},
      inputValue: '',
      currentRepoUrl: '',
      currentBranch: '',
      searchErrorMessage: '',
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

  componentDidMount(): void {
    // Get the repo and branch queries from the URL and make a search
    const url = `github.com${window.location.pathname}`
    const repo = URLUtil.extractRepoPath(url)
    const branch = URLUtil.getSearchParam('branch', 'default')

    if (repo) {
      // Clean the URL to remove unnecessary paths
      URLUtil.updateURLPath(repo + window.location.search)

      this.mountedWithFile = true
      this.setState({ inputValue: url }, () => {
        this.getRepo(url, branch)
      })
    }
  }

  onInputChange(inputValue: string): void {
    this.setState({
      inputValue,
      searchErrorMessage: ''
    })
  }

  async getRepo(url: string, branch = 'default'): Promise<void> {
    const extractedPath = URLUtil.extractRepoPath(url)

    if (!url) {
      return
    }

    this.props.onSearchStarted()

    this.setState({ searchErrorMessage: '' })

    // If we try to load the tree for the repository and it
    // fails, don't try to load the branches
    try {
      await this.getTree(url, branch)
      await this.getBranches(url)

      this.props.onSearchFinished(false)
      this.props.setRepoData({
        repoPath: extractedPath as string,
        branch: this.state.currentBranch
      })
    } catch (err) {
      this.props.onSearchFinished(true)
    }
  }

  getTree(repoUrl: string, branch: string): Promise<void> {
    this.toggleLoading()

    return GitHubAPI.getTree(repoUrl, branch)
      .then(res => {
        this.setState(prevState => ({
          treeData: Tree.treeify(res.data.tree),
          currentBranch: res.branch,
          panels: {
            ...prevState.panels,
            code: {
              ...prevState.panels.code,
              isOpen: true
            }
          }
        }))

        const repoPath = URLUtil.extractRepoPath(repoUrl)

        // Small hack: because this component may be mounted with the repo
        // path in the URL, we need to make sure we don't reset that URL
        // on load since that URL might contain a file path
        if (!this.mountedWithFile) {
          URLUtil.updateURLPath(repoPath as string)
        }

        URLUtil.updateURLSearchParams({ branch: res.branch })
        document.title = `Git Browser - ${repoPath}`
        this.mountedWithFile = false
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

  getBranches(repoUrl: string): Promise<void> {
    return GitHubAPI.getBranches(repoUrl).then(data => {
      this.setState(prevState => ({
        branches: data.branches,
        isBranchListTruncated: data.truncated,
        panels: {
          ...prevState.panels,
          branches: {
            ...prevState.panels.branches,
            isOpen: true
          }
        }
      }))
    })
  }

  getBranch(branch: Branch): void {
    if (this.state.currentBranch === branch.name) {
      return
    }

    this.props.onSearchStarted()

    this.getTree(branch.repoUrl, branch.name)
      .then(() => {
        this.props.onSearchFinished(false)
        this.props.setRepoData({ branch: branch.name })
      })
      .catch(err => {
        Logger.error(err)
        this.props.onSearchFinished(true)
      })
  }

  toggleLoading(): void {
    this.setState(prevState => ({ isLoading: !prevState.isLoading }))
  }

  toggleExplorer(): void {
    this.setState(prevState => ({ isExplorerOpen: !prevState.isExplorerOpen }))
  }

  openExplorer(): void {
    this.setState({ isExplorerOpen: true })
  }

  closeExplorer(): void {
    this.setState({ isExplorerOpen: false })
  }

  togglePanel(panel: string, isOpen: boolean, scrollIntoView = false): void {
    if (!this.state.panels[panel]) {
      Logger.warn('No panel with name', panel)
      return
    }

    this.setState(
      prevState => ({
        isExplorerOpen: true,
        panels: {
          ...prevState.panels,
          [panel]: {
            ...prevState.panels[panel],
            isOpen
          }
        }
      }),
      () => {
        if (scrollIntoView) {
          this.scrollToPanel(panel)
        }
      }
    )
  }

  scrollToPanel(panelName: string) {
    const panel = this.state.panels[panelName].ref.current

    if (panel) {
      panel.scrollIntoView()
    }
  }

  panelButtons(): PanelAction[] {
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

  render(): JSX.Element {
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
    const key = `${currentRepoUrl}/${currentBranch}`

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
          type="button"
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
              activeFilePath={this.props.activeFilePath}
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

export default connector(ExplorerPanel)
