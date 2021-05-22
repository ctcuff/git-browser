import '../style/tree-node.scss'
import React from 'react'
import { FaRegFile, FaFolder, FaFolderOpen } from 'react-icons/fa'
import { FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { withClasses } from '../scripts/util'
import { TreeNodeObject } from '../scripts/tree'

type TreeNodeProps = {
  onSelectNode: (node: TreeNodeObject) => void
  node: TreeNodeObject
  onToggle?: (node: TreeNodeObject) => void
  getChildren?: (node: TreeNodeObject) => TreeNodeObject[]
  showPath?: boolean
  className?: string
  activeFilePath?: string | null
  level?: number
}

const getPaddingLeft = (
  level: number,
  type: TreeNodeObject['type']
): number => {
  const defaultPadding = 20

  if (level === 0) {
    if (type === 'file') {
      return defaultPadding
    }
    return 8
  }

  let paddingLeft = level * defaultPadding

  if (type === 'file') {
    paddingLeft += defaultPadding
  }

  return paddingLeft
}

/**
 * Takes a full file path and returns only the name of the folder
 * or file. Ex: `src/components/App.jsx => App.jsx`
 */
const getNodeLabel = (node: TreeNodeObject): string => {
  const path = node.path.split('/').filter(str => !!str.trim())
  return path[path.length - 1]
}

const renderIcon = (
  type: TreeNodeObject['type'],
  isOpen: boolean
): JSX.Element => {
  if (type === 'file') {
    return <FaRegFile />
  }

  if (type === 'folder' && isOpen) {
    return <FaFolderOpen className="folder-icon" />
  }

  return <FaFolder className="folder-icon" />
}

const renderToggleIcon = (
  type: TreeNodeObject['type'],
  isOpen: boolean
): JSX.Element | null => {
  if (type === 'file') {
    return null
  }

  return type === 'folder' && isOpen ? <FiChevronDown /> : <FiChevronRight />
}

const onSelectNode = (node: TreeNodeObject, props: TreeNodeProps): void => {
  if (node.type === 'folder') {
    if (props.onToggle) {
      props.onToggle(node)
    }
  } else {
    props.onSelectNode(node)
  }
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const {
    node,
    getChildren = () => [],
    level = 0,
    showPath = false,
    activeFilePath = '',
    className = ''
  } = props

  const children = getChildren(node)
  const nodeLabel = getNodeLabel(node)
  const classes = withClasses({
    [className]: true,
    'is-active': node.path === activeFilePath
  })

  return (
    <>
      <div
        className={`tree-node ${classes}`}
        title={node.path}
        style={{ paddingLeft: getPaddingLeft(level, node.type) }}
        onClick={() => onSelectNode(node, props)}
      >
        <div className="tree-node__icon toggle">
          {renderToggleIcon(node.type, node.isOpen)}
        </div>
        <div className="tree-node__icon type">
          {renderIcon(node.type, node.isOpen)}
        </div>
        <div className="node-label">
          {nodeLabel} {showPath && <small>{node.path}</small>}
        </div>
      </div>
      {node.isOpen &&
        children.map(childNode => (
          <TreeNode
            {...props}
            node={childNode}
            level={level + 1}
            key={childNode.path}
          />
        ))}
    </>
  )
}

export default TreeNode
