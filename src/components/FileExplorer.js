import '../style/file-explorer.scss'
import React, { Component } from 'react'
import partition from 'lodash/partition'
import PropTypes from 'prop-types'
import TreeNode from './TreeNode'

class FileExplorer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      nodes: this.props.nodes,
      repoName: this.props.repoName
    }

    this.getRootNodes = this.getRootNodes.bind(this)
    this.getChildren = this.getChildren.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.onSelectNode = this.onSelectNode.bind(this)
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

    return Object.values(nodes).filter(node => node.isRoot === true)
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

  onToggle(node) {
    const nodes = this.state.nodes

    nodes[node.path].isOpen = !node.isOpen

    this.setState({ nodes })
  }

  onSelectNode(node) {
    if (node.type === 'file') {
      this.props.onSelectFile(node)
    }
  }

  render() {
    const rootNodes = this.getRootNodes()

    if (!rootNodes || rootNodes.length === 0) {
      return null
    }

    return (
      <div className="file-explorer">
        <React.Fragment>
          {rootNodes.map(node => (
            <TreeNode
              node={node}
              key={node.path}
              getChildren={this.getChildren}
              onToggle={this.onToggle}
              onSelectNode={this.onSelectNode}
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
      type: PropTypes.string,
      name: PropTypes.string,
      path: PropTypes.path,
      url: PropTypes.string,
      isRoot: PropTypes.bool
    })
  ),
  repoName: PropTypes.string
}

FileExplorer.defaultProps = {
  nodes: {},
  repoName: ''
}

export default FileExplorer
