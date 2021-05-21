// eslint-disable-next-line import/no-extraneous-dependencies
import 'simplebar/dist/simplebar.css'
import '../style/tabs.scss'
import React, { useEffect, useState } from 'react'
import { Tabs, TabList, TabPanel, Tab as ReactTab } from 'react-tabs'
import SimpleBar from 'simplebar-react'
import { connect, ConnectedProps } from 'react-redux'
import { VscCloseAll } from 'react-icons/vsc'
import { AiOutlineMenu } from 'react-icons/ai'
import ContextMenu, { MenuOption } from './ContextMenu'
import URLUtil from '../scripts/url-util'
import { copyToClipboard } from '../scripts/util'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from './ModalRoot'
import { State } from '../store'

const mapStateToProps = (state: State) => ({
  branch: state.search.branch,
  repoPath: state.search.repoPath
})

const mapDispatchToProps = {
  showModal
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type TabProps = {
  // These props are accessed in the TabView component
  // eslint-disable-next-line react/no-unused-prop-types
  title: string
  // eslint-disable-next-line react/no-unused-prop-types
  path: string
  children: React.ReactNode
}

type TabViewProps = ConnectedProps<typeof connector> & {
  children: typeof Tab[] | React.ReactNode
  activeTabIndex: number
  onCloseAllClick: () => void
  onCloseOtherTabsClick: (menuTabIndex: number) => void
  onTabClosed: (tabIndex: number) => void
  onSelectTab: (tabIndex: number) => void
}

// Just a wrapper that makes working with tha tab view feel a little
// cleaner. This allows the TabView to also access the props of each
// of its tabs
const Tab = ({ children }: TabProps): JSX.Element => <>{children}</>

const TabView = (props: TabViewProps): JSX.Element | null => {
  const { onTabClosed, onSelectTab, activeTabIndex, repoPath, branch } = props
  const [isContextMenuOpen, toggleContextMenu] = useState(false)
  const [contextMenuCoords, setContextMenuCoords] = useState({ x: 0, y: 0 })
  // The index of the tab where the context menu was activated
  const [menuTabIndex, setMenuTabIndex] = useState(0)
  const [isDownloadAlertShowing, setShowDownloadAlert] = useState(false)
  const tabs = props.children as React.ReactElement<TabProps>[]

  const onSelect = (index: number, prevIndex: number, event: Event): void => {
    // Clicking anywhere on the tab fires the tab's onSelect
    // event so we need to watch for a click on the close button
    if ((event.target as HTMLElement).nodeName === 'BUTTON') {
      onTabClosed(index)
      return
    }

    onSelectTab(index)
  }

  const onContextMenu = (index: number, event: React.MouseEvent): void => {
    event.preventDefault()

    setMenuTabIndex(index)
    setContextMenuCoords({
      x: event.pageX,
      y: event.pageY
    })
    toggleContextMenu(true)
  }

  const openFileInGitHub = (): void => {
    const filePath = tabs[menuTabIndex].props.path
    const url = URLUtil.buildGithubFileURL({
      repoPath,
      branch,
      filePath
    })

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const downloadFile = (): void => {
    setShowDownloadAlert(true)

    URLUtil.downloadGithubFile({
      repoPath,
      branch,
      filePath: tabs[menuTabIndex].props.path
    })
      .catch(() => props.showModal(ModalTypes.FILE_DOWNLOAD_ERROR))
      .finally(() => {
        // Prevents the alert message from flickering if it closes too fast
        setTimeout(() => setShowDownloadAlert(false), 5000)
      })
  }

  const menuOptions: MenuOption[] = [
    {
      title: 'View file on GitHub',
      onClick: openFileInGitHub
    },
    {
      title: 'Copy file path',
      onClick: () => copyToClipboard(`/${tabs[menuTabIndex].props.path}`)
    },
    {
      title: 'Download file',
      onClick: downloadFile
    },
    {
      title: 'Close tab',
      onClick: () => onTabClosed(menuTabIndex)
    },
    {
      title: 'Close other tabs',
      disabled: tabs.length <= 1,
      onClick: () => props.onCloseOtherTabsClick(menuTabIndex)
    }
  ]

  useEffect(() => {
    // Close the context menu when any key is pressed or when the
    // document looses focus
    const callback = () => toggleContextMenu(false)

    document.addEventListener('keypress', callback)
    document.addEventListener('blur', callback)

    return () => {
      document.removeEventListener('keypress', callback)
      document.removeEventListener('blur', callback)
    }
  }, [])

  useEffect(() => {
    // Sometimes clicking "Close tab" keeps the context menu open when
    // another tab is opened so we need to make sure the context menu
    // remains closed when tabs are opened/closed
    toggleContextMenu(false)
  }, [tabs.length])

  if (tabs.length <= 0) {
    return null
  }

  return (
    <Tabs className="tabs" onSelect={onSelect} selectedIndex={activeTabIndex}>
      <ContextMenu
        isOpen={isContextMenuOpen}
        coords={contextMenuCoords}
        options={menuOptions}
        onOverlayClick={() => toggleContextMenu(false)}
        onOptionClick={() => toggleContextMenu(false)}
      />
      <div
        className={`tab-file-download-alert ${
          isDownloadAlertShowing ? 'is-showing' : ''
        }`}
      >
        {tabs[menuTabIndex] && (
          <>
            <button onClick={() => setShowDownloadAlert(false)} type="button">
              &times;
            </button>
            <p>Downloading {tabs[menuTabIndex].props.title}...</p>
          </>
        )}
      </div>
      <SimpleBar className="tab-simplebar">
        <div className="scroll-container">
          <TabList className="tab-list">
            <button
              className="close-all-button"
              title="Close all tabs"
              onClick={props.onCloseAllClick}
              type="button"
            >
              <VscCloseAll />
            </button>
            {tabs.map((tab, index) => (
              <ReactTab
                className="tab"
                selectedClassName="tab--selected"
                key={index}
                onContextMenu={(event: React.MouseEvent) =>
                  onContextMenu(index, event)
                }
              >
                <span className="tab-title" title={tab.props.path}>
                  {tab.props.title}
                </span>{' '}
                <button className="tab-close-button" type="button">
                  &times;
                </button>
              </ReactTab>
            ))}
          </TabList>
        </div>
      </SimpleBar>
      {tabs.map((tab, index) => (
        <TabPanel
          selectedClassName="tab-panel--selected"
          className="tab-panel"
          key={index}
        >
          <button
            className="tab-context-menu-toggle"
            onClick={(event: React.MouseEvent) => onContextMenu(index, event)}
            type="button"
          >
            <AiOutlineMenu />
          </button>
          {tab.props.children}
        </TabPanel>
      ))}
    </Tabs>
  )
}

const ConnectedTabView = connector(TabView)

export { ConnectedTabView as TabView, Tab }
