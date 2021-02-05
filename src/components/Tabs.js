import 'simplebar/dist/simplebar.css'
import '../style/tabs.scss'
import React, { useEffect, useState } from 'react'
import { Tabs, TabList, TabPanel, Tab as ReactTab } from 'react-tabs'
import PropTypes from 'prop-types'
import SimpleBar from 'simplebar-react'
import { VscCloseAll } from 'react-icons/vsc'
import ContextMenu from './ContextMenu'
import { connect } from 'react-redux'
import URLUtil from '../scripts/url-util'
import { copyToClipboard } from '../scripts/util'
import { showModal } from '../store/actions/modal'
import { ModalTypes } from './ModalRoot'

const Tab = props => <React.Fragment>{props.children}</React.Fragment>

const TabView = props => {
  const { onTabClosed, onSelectTab, activeTabIndex, repoPath, branch } = props
  const tabs = props.children
  const [isContextMenuOpen, toggleContextMenu] = useState(false)
  const [contextMenuCoords, setContextMenuCoords] = useState({ x: 0, y: 0 })
  const [menuTabIndex, setMenuTabIndex] = useState(0)
  const [isDownloadAlertShowing, setShowDownloadAlert] = useState(false)

  const onSelect = (index, prevIndex, event) => {
    // Clicking anywhere on the tab fires the tab's onSelect
    // event so we need to watch for a click on the close button
    if (event.target.nodeName === 'BUTTON') {
      onTabClosed(index)
      return
    }

    onSelectTab(index)
  }

  const onContextMenu = (index, event) => {
    event.preventDefault()

    setMenuTabIndex(index)
    setContextMenuCoords({
      x: event.pageX,
      y: event.pageY
    })
    toggleContextMenu(true)
  }

  const openFileInGitHub = () => {
    const filePath = tabs[menuTabIndex].props.path
    const url = URLUtil.buildGithubFileURL({
      repoPath,
      branch,
      filePath
    })

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const downloadFile = () => {
    setShowDownloadAlert(true)

    URLUtil.downloadGithubFile({
      repoPath,
      branch,
      filePath: tabs[menuTabIndex].props.path
    })
      .catch(() => props.showModal(ModalTypes.FILE_DOWNLOAD_ERROR))
      .finally(() => {
        // Prevents the alert message from flickering if it closes too fast
        setTimeout(() => {
          setShowDownloadAlert(false)
        }, 3000)
      })
  }

  const menuOptions = [
    {
      title: 'View file on GitHub',
      onClick: openFileInGitHub
    },
    {
      title: 'Copy file path',
      onClick: () => copyToClipboard('/' + tabs[menuTabIndex].props.path)
    },
    {
      title: 'Download file',
      onClick: downloadFile
    },
    {
      title: 'Close tab',
      onClick: () => onTabClosed(menuTabIndex)
    }
  ]

  useEffect(() => {
    const callback = toggleContextMenu.bind(this, false)
    document.addEventListener('click', callback)
    document.addEventListener('keypress', callback)
    document.addEventListener('blur', callback)
    return () => {
      document.removeEventListener('click', callback)
      document.removeEventListener('keypress', callback)
      document.removeEventListener('blur', callback)
    }
  }, [])

  if (tabs.length <= 0) {
    return null
  }

  return (
    <Tabs className="tabs" onSelect={onSelect} selectedIndex={activeTabIndex}>
      <ContextMenu
        isOpen={isContextMenuOpen}
        coords={contextMenuCoords}
        options={menuOptions}
      />
      <div
        className={`tab-file-download-alert ${
          isDownloadAlertShowing ? 'is-showing' : ''
        }`}
      >
        {tabs[menuTabIndex] && (
          <React.Fragment>
            <button onClick={setShowDownloadAlert.bind(this, false)}>
              &times;
            </button>
            <p>Downloading {tabs[menuTabIndex].props.title}...</p>
          </React.Fragment>
        )}
      </div>
      <SimpleBar className="tab-simplebar">
        <div className="scroll-container">
          <TabList className="tab-list">
            <button
              className="close-all-button"
              title="Close all tabs"
              onClick={props.onCloseAllClick}
            >
              <VscCloseAll />
            </button>
            {tabs.map((tab, index) => (
              <ReactTab
                className="tab"
                selectedClassName="tab--selected"
                key={index}
                onContextMenu={onContextMenu.bind(this, index)}
              >
                <span className="tab-title" title={tab.props.path}>
                  {tab.props.title}
                </span>{' '}
                <button className="tab-close-button">&times;</button>
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
          {tab.props.children}
        </TabPanel>
      ))}
    </Tabs>
  )
}

Tab.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  path: PropTypes.string
}

TabView.propTypes = {
  // Make sure the tab view only has tabs as direct children
  children: PropTypes.oneOfType([
    PropTypes.shape({
      type: PropTypes.oneOf([Tab])
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.oneOf([Tab])
      })
    )
  ]),
  onTabClosed: PropTypes.func.isRequired,
  activeTabIndex: PropTypes.number.isRequired,
  onSelectTab: PropTypes.func.isRequired,
  onCloseAllClick: PropTypes.func.isRequired,
  repoPath: PropTypes.string,
  branch: PropTypes.string,
  showModal: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  branch: state.search.branch,
  repoPath: state.search.repoPath
})

const mapDispatchToProps = {
  showModal
}

const ConnectedTabView = connect(mapStateToProps, mapDispatchToProps)(TabView)

export { ConnectedTabView as TabView, Tab }
