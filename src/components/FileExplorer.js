import '../style/file-explorer.scss'
import React from 'react'
import partition from 'lodash/partition'
import PropTypes from 'prop-types'
import TreeNode from './TreeNode'
import { VscCollapseAll } from 'react-icons/vsc'

class FileExplorer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      nodes: this.props.nodes,
      repoName: this.props.repoName
    }

    this.getRootNodes = this.getRootNodes.bind(this)
    this.getChildren = this.getChildren.bind(this)
    this.toggleNode = this.toggleNode.bind(this)
    this.onSelectNode = this.onSelectNode.bind(this)
    this.closeAllFolders = this.closeAllFolders.bind(this)
    this.openUpToRoot = this.openUpToRoot.bind(this)
  }

  componentDidUpdate(prevProps) {
    const activeFilePath = this.props.activeFilePath

    // When the active file changes, find the new active file and open
    // every parent folder until the root. Note that this behavior is
    // disabled with a large number of nodes for performance reasons.
    if (
      activeFilePath &&
      prevProps.activeFilePath !== activeFilePath &&
      Object.keys(this.state.nodes).length <= 1500
    ) {
      this.openUpToRoot(activeFilePath)
    }
  }

  openUpToRoot(path) {
    const nodes = this.state.nodes

    if (nodes[path].type === 'folder' && !nodes[path].isOpen) {
      this.toggleNode(nodes[path])
    }

    if (nodes[path].parent) {
      this.openUpToRoot(nodes[path].parent)
    }
  }

  getRootNodes() {
    const nodes = {}

    // Partition the nodes into folders and files so that
    // folders appear before files
    const [left, right] = partition(
      this.state.nodes,
      node => node.type === 'folder'
    )

    left.forEach(node => (nodes[node.path] = node))
    right.forEach(node => (nodes[node.path] = node))

    return Object.values(nodes).filter(node => node.isRoot)
  }

  getChildren(node) {
    const nodes = this.state.nodes

    if (!node.children) {
      return []
    }

    const children = node.children.map(path => nodes[path])
    const [left, right] = partition(children, n => n.type === 'folder')

    return [...left, ...right]
  }

  toggleNode(node) {
    const nodes = this.state.nodes

    nodes[node.path].isOpen = !node.isOpen

    this.setState({
      nodes: {
        ...nodes
      }
    })
  }

  onSelectNode(node) {
    if (node.type === 'file') {
      this.props.onSelectFile(node)
    }
  }

  closeAllFolders() {
    const nodes = this.state.nodes

    Object.keys(nodes).forEach(key => {
      const node = nodes[key]
      if (node.type === 'folder') {
        node.isOpen = false
      }
    })

    this.setState({
      nodes: {
        ...nodes
      }
    })
  }

  render() {
    const rootNodes = this.getRootNodes()

    if (!rootNodes || rootNodes.length === 0) {
      return null
    }

    return (
      <div className="file-explorer">
        <button
          className="collapse-btn"
          onClick={this.closeAllFolders}
          title="Collapse folders in explorer"
        >
          <VscCollapseAll />
          <span>Collapse folders</span>
        </button>
        <React.Fragment>
          {rootNodes.map(node => (
            <TreeNode
              node={node}
              key={node.path}
              getChildren={this.getChildren}
              onToggle={this.toggleNode}
              onSelectNode={this.onSelectNode}
              activeFilePath={this.props.activeFilePath}
            />
          ))}
        </React.Fragment>
      </div>
    )
  }
}

FileExplorer.propTypes = {
  onSelectFile: PropTypes.func.isRequired,
  nodes: PropTypes.objectOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['file', 'folder']),
      name: PropTypes.string,
      path: PropTypes.path,
      url: PropTypes.string,
      isRoot: PropTypes.bool
    })
  ),
  repoName: PropTypes.string,
  activeFilePath: PropTypes.string.isRequired
}

FileExplorer.defaultProps = {
  nodes: {},
  repoName: ''
}

export default FileExplorer
