import '../style/file-explorer.scss'
import React from 'react'
import partition from 'lodash/partition'
import { VscCollapseAll } from 'react-icons/vsc'
import URLUtil from '../scripts/url-util'
import TreeNode from './TreeNode'
import { TreeNodeObject, TreeObject } from '../scripts/tree'

type FileExplorerProps = {
  nodes: TreeObject
  onSelectFile: (file: TreeNodeObject) => void
  activeFilePath: string
}

type FileExplorerState = {
  nodes: TreeObject
}

class FileExplorer extends React.PureComponent<
  FileExplorerProps,
  FileExplorerState
> {
  static defaultProps: Partial<FileExplorerProps> = {
    activeFilePath: '',
    onSelectFile: (): void => {}
  }

  constructor(props: FileExplorerProps) {
    super(props)
    this.state = {
      nodes: props.nodes
    }

    this.getRootNodes = this.getRootNodes.bind(this)
    this.getChildren = this.getChildren.bind(this)
    this.toggleNode = this.toggleNode.bind(this)
    this.onSelectFile = this.onSelectFile.bind(this)
    this.closeAllFolders = this.closeAllFolders.bind(this)
    this.openUpToRoot = this.openUpToRoot.bind(this)
  }

  componentDidMount(): void {
    const key = URLUtil.getSearchParam('file', '')
    const node = this.state.nodes[key]
    const { activeFilePath } = this.props

    if (node) {
      this.onSelectFile(node)
    }

    if (activeFilePath) {
      this.openUpToRoot(activeFilePath)
    }
  }

  onSelectFile(node: TreeNodeObject): void {
    if (node.type === 'file') {
      this.props.onSelectFile(node)
    }
  }

  getRootNodes(): TreeNodeObject[] {
    const nodes: TreeObject = {}

    // Partition the nodes into folders and files so that
    // folders appear before files
    const [left, right] = partition(
      this.state.nodes,
      node => node.type === 'folder'
    )

    left.forEach(node => {
      nodes[node.path!] = node
    })

    right.forEach(node => {
      nodes[node.path!] = node
    })

    return Object.values(nodes).filter(node => node.isRoot)
  }

  getChildren(node: TreeNodeObject): TreeNodeObject[] {
    const { nodes } = this.state

    if (!node.children) {
      return []
    }

    const children = node.children.map(path => nodes[path])
    const [left, right] = partition(children, n => n.type === 'folder')

    return [...left, ...right]
  }

  openUpToRoot(path: string): void {
    const { nodes } = this.state

    if (!nodes[path]) {
      return
    }

    if (nodes[path].type === 'folder' && !nodes[path].isOpen) {
      this.toggleNode(nodes[path])
    }

    if (nodes[path].parent) {
      this.openUpToRoot(nodes[path].parent as string)
    }
  }

  toggleNode(node: TreeNodeObject): void {
    const { nodes } = this.state

    nodes[node.path!].isOpen = !node.isOpen

    this.setState({
      nodes: {
        ...nodes
      }
    })
  }

  closeAllFolders(): void {
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

  render(): JSX.Element | null {
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

export default FileExplorer
