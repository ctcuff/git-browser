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

  static getDerivedStateFromProps(props, state) {
  // Don't allow this component to re-render if:
  //  - It doesn't have any nodes to render
  //  - A user searches for the same repository twice
    if (
      !props.nodes ||
      Object.keys(props.nodes).length === 0 ||
      props.repoName === state.repoName
    ) {
      return null
    }

    return {
      nodes: props.nodes,
      repoName: props.repoName
    }
  }

  getRootNodes() {
    const nodes = {}
    const [left, right] = partition(
      this.state.nodes,
      node => node.type === 'folder'
    )

    left.forEach(node => (nodes[node.path] = node))
    right.forEach(node => (nodes[node.path] = node))

    return Object.values(nodes).filter(node => node.isRoot === true)
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

  onToggle(node) {
    const { nodes } = this.state

    nodes[node.path].isOpen = !node.isOpen

    this.setState({ nodes })
  }

  onSelectNode(node) {
    this.props.onSelect(node)
  }

  render() {
    const rootNodes = this.getRootNodes()
    return (
      <div className="file-explorer">
        <React.Fragment>
          {rootNodes.map(node => (
            <TreeNode
              node={node}
              key={node.path}
              getChildren={this.getChildren}
              onToggle={this.onToggle}
              onSelectNode={this.props.onSelectFile}
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
