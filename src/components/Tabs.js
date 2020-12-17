import '../style/tabs.scss'
import React from 'react'
import {
  Tabs as ReactTabs,
  Tab as ReactTab,
  TabList,
  TabPanel as ReactTabPanel
} from 'react-tabs'

const Tab = props => <React.Fragment>{props.children}</React.Fragment>

class TabView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tabs: React.Children.toArray(this.props.children),
      selectedTabIndex: 0
    }

    this.renderCloseButton = this.renderCloseButton.bind(this)
    this.closeTab = this.closeTab.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.closeTab = this.closeTab.bind(this)
  }

  // Need to watch for prop changes in children so that the
  // component can update its state and re-render
  static getDerivedStateFromProps(props, state) {
    const children = React.Children.toArray(props.children)
    const tabs = state.tabs

    // A tab was closed
    if (tabs.length === children.length) {
      return {
        tabs
      }
    }

    // A new tab was added
    return {
      tabs: children,
      selectedTabIndex: tabs.length
    }
  }

  closeTab(clickedIndex) {
    this.props.onTabClosed(clickedIndex)
    let selectedTabIndex = this.state.selectedTabIndex

    // If the first tabs was closed but there are still tabs left,
    // set the tab to the right of the closed tab as the active tab
    if (clickedIndex === selectedTabIndex) {
      selectedTabIndex = Math.max(selectedTabIndex - 1, 0)
    }

    // Makes sure the currently active tab doesn't change when tabs
    // to teh left of it are closed
    if (clickedIndex < selectedTabIndex) {
      selectedTabIndex -= 1
    }

    this.setState({
      tabs: this.state.tabs.filter((tab, index) => clickedIndex !== index),
      selectedTabIndex
    })
  }

  renderCloseButton() {
    return <button className="tab-close-button">&times;</button>
  }

  onSelect(index, last, event) {
    if (event.target.nodeName === 'BUTTON') {
      this.closeTab(index)
      return
    }

    this.setState({ selectedTabIndex: index })
  }

  render() {
    const tabs = this.state.tabs

    return (
      <ReactTabs
        className="tabs"
        onSelect={this.onSelect}
        selectedIndex={this.state.selectedTabIndex}
      >
        <TabList className="tab-list">
          {tabs.map((tab, index) => (
            <ReactTab
              className="tab"
              selectedClassName="tab--selected"
              key={index}
            >
              <span>{tab.props.title}</span> {this.renderCloseButton()}
            </ReactTab>
          ))}
        </TabList>

        {tabs.map((tab, index) => (
          <ReactTabPanel
            selectedClassName="tab-panel--selected"
            className="tab-panel"
            key={index}
          >
            {tab.props.children}
          </ReactTabPanel>
        ))}
      </ReactTabs>
    )
  }
}

export { TabView, Tab }
