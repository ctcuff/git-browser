import 'simplebar/dist/simplebar.css'
import '../style/tabs.scss'
import React from 'react'
import { Tabs, TabList, TabPanel, Tab as ReactTab } from 'react-tabs'
import PropTypes from 'prop-types'
import SimpleBar from 'simplebar-react'

const Tab = props => <React.Fragment>{props.children}</React.Fragment>

const TabView = props => {
  const { onTabClosed, onSelectTab, activeTabIndex } = props
  const tabs = props.children

  if (tabs.length <= 0) {
    return null
  }

  const onSelect = (index, prevIndex, event) => {
    // Clicking anywhere on the tab fires the tab's onSelect
    // event so we need to watch for a click on the close button
    if (event.target.nodeName === 'BUTTON') {
      onTabClosed(index)
      return
    }

    onSelectTab(index)
  }

  return (
    <Tabs className="tabs" onSelect={onSelect} selectedIndex={activeTabIndex}>
      <SimpleBar>
        <div className="scroll-container">
          <TabList className="tab-list">
            {tabs.map((tab, index) => (
              <ReactTab
                className="tab"
                selectedClassName="tab--selected"
                key={index}
              >
                <span className="tab-title" title={tab.props.hint}>
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
  hint: PropTypes.string
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
  activeTabIndex: PropTypes.number.isRequired
}

export { TabView, Tab }
