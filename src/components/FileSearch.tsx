import '../style/file-search.scss'
import React, { useEffect, useState } from 'react'
import SearchInput from './SearchInput'
import TreeNode, { TreeNodeData } from './TreeNode'

type FileSearchProps = {
  onSelectFile: (node: TreeNodeData) => void
  activeFilePath: string
  treeData: {
    [key: string]: TreeNodeData
  }
}

// The maximum number of files that a search
// result will display
const MAX_DISPLAY_COUNT = 50

const FileSearch = (props: FileSearchProps): JSX.Element => {
  const [inputValue, setInputValue] = useState('')
  const [hasError, setHasError] = useState(false)
  const [filteredTreeData, setFilteredTreeData] = useState<
    FileSearchProps['treeData']
  >({})

  const onChange = (value: string) => {
    setInputValue(value)
    setHasError(false)
  }

  const onSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredTreeData({})
      return
    }

    let count = 0
    const nodes: FileSearchProps['treeData'] = {}
    const query = value.toLowerCase()

    Object.keys(props.treeData).forEach(key => {
      const node = props.treeData[key]

      if (
        count < MAX_DISPLAY_COUNT &&
        node.type === 'file' &&
        (node.name.toLowerCase().includes(query) ||
          node.path.toLowerCase().includes(query))
      ) {
        // Mark the node as root so the FileExplorer doesn't
        // add any margin to the file
        nodes[key] = {
          ...node,
          isRoot: true
        }
        count++
      }
    })

    setHasError(count === 0)

    if (count > 0) {
      setFilteredTreeData(nodes)
    }
  }

  useEffect(() => {
    setInputValue('')
    setFilteredTreeData({})
  }, [props.treeData])

  return (
    <div className="file-search">
      <SearchInput
        className="file-search-input"
        onSearch={onSearch}
        placeholder="Search file"
        value={inputValue}
        onChange={onChange}
        hasError={hasError}
        errorMessage="No files found"
      />
      {Object.keys(filteredTreeData).map((key, index) => (
        <TreeNode
          showPath
          className="file-search-node"
          key={index}
          node={filteredTreeData[key]}
          onSelectNode={props.onSelectFile}
          activeFilePath={props.activeFilePath}
        />
      ))}
    </div>
  )
}

export default FileSearch
