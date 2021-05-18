import '../style/file-explorer.scss'
import React from 'react'
import partition from 'lodash/partition'
import PropTypes from 'prop-types'
import { VscCollapseAll } from 'react-icons/vsc'
import TreeNode from './TreeNode'
import URLUtil from '../scripts/url-util'

class FileExplorer extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      nodes: this.props.nodes
    }

    this.getRootNodes = this.getRootNodes.bind(this)
    this.getChildren = this.getChildren.bind(this)
    this.toggleNode = this.toggleNode.bind(this)
    this.onSelectFile = this.onSelectFile.bind(this)
    this.closeAllFolders = this.closeAllFolders.bind(this)
    this.openUpToRoot = this.openUpToRoot.bind(this)
  }

  componentDidMount() {
    const key = URLUtil.getSearchParam('file')
    const node = this.state.nodes[key]
    const { activeFilePath } = this.props

    if (node) {
      this.props.onSelectFile(node)
    }

    if (activeFilePath) {
      this.openUpToRoot(activeFilePath)
    }
  }

  onSelectFile(node) {
    if (node.type === 'file') {
      this.props.onSelectFile(node)
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

    left.forEach(node => {
      nodes[node.path] = node
    })

    right.forEach(node => {
      nodes[node.path] = node
    })

    return Object.values(nodes).filter(node => node.isRoot)
  }

  getChildren(node) {
    const { nodes } = this.state

    if (!node.children) {
      return []
    }

    const children = node.children.map(path => nodes[path])
    const [left, right] = partition(children, n => n.type === 'folder')

    return [...left, ...right]
  }

  openUpToRoot(path) {
    const { nodes } = this.state

    if (!nodes[path]) {
      return
    }

    if (nodes[path].type === 'folder' && !nodes[path].isOpen) {
      this.toggleNode(nodes[path])
    }

    if (nodes[path].parent) {
      this.openUpToRoot(nodes[path].parent)
    }
  }

  toggleNode(node) {
    const { nodes } = this.state

    nodes[node.path].isOpen = !node.isOpen

    this.setState({
      nodes: {
        ...nodes
      }
    })
  }

  closeAllFolders() {
    const { nodes } = this.state

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

    if (rootNodes?.length === 0) {
      return null
    }

    return (
      <div className="file-explorer">
        <button
          className="collapse-btn"
          onClick={this.closeAllFolders}
          title="Collapse folders in explorer"
          type="button"
        >
          <VscCollapseAll />
          <span>Collapse folders</span>
        </button>
        {rootNodes.map(node => (
          <TreeNode
            node={node}
            key={node.path}
            getChildren={this.getChildren}
            onToggle={this.toggleNode}
            onSelectNode={this.onSelectFile}
            activeFilePath={this.props.activeFilePath}
          />
        ))}
      </div>
    )
  }
}

FileExplorer.propTypes = {
  onSelectFile: PropTypes.func,
  nodes: PropTypes.objectOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['file', 'folder']),
      name: PropTypes.string,
      path: PropTypes.path,
      url: PropTypes.string,
      isRoot: PropTypes.bool
    })
  ),
  activeFilePath: PropTypes.string
}

FileExplorer.defaultProps = {
  nodes: {},
  activeFilePath: '',
  onSelectFile: () => {}
}

export default FileExplorer
