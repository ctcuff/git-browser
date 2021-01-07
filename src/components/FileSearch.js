import '../style/file-search.scss'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import SearchInput from './SearchInput'
import TreeNode from './TreeNode'

const MAX_FILTER_RESULT = 50

const FileSearch = props => {
  const [inputValue, setInputValue] = useState('')
  const [hasError, setHasError] = useState(false)
  const [filteredTreeData, setFilteredTreeData] = useState({})

  const onSearch = value => {
    if (!value.trim()) {
      setFilteredTreeData({})
      return
    }

    let count = 0
    const nodes = {}
    const query = value.toLowerCase()

    Object.keys(props.treeData).forEach(key => {
      const node = props.treeData[key]

      if (
        count < MAX_FILTER_RESULT &&
        node.type === 'file' &&
        (node.name.toLowerCase().includes(query) ||
          node.path.toLowerCase().includes(query))
      ) {
        // Mark the node as root so the FileExplorer doesn't
        // add any margin to the file
        nodes[key] = { ...node }
        nodes[key].isRoot = true
        count++
      }
    })

    setHasError(count === 0)
    setFilteredTreeData(nodes)
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
        onChange={setInputValue}
        hasError={hasError}
        errorMessage="No files found"
      />
      <React.Fragment>
        {Object.keys(filteredTreeData).map((key, index) => (
          <TreeNode
            showPath
            className="file-search-node"
            key={index}
            node={filteredTreeData[key]}
            onSelectNode={props.onSelectFile}
          />
        ))}
      </React.Fragment>
    </div>
  )
}

FileSearch.propTypes = {
  onSelectFile: PropTypes.func.isRequired,
  treeData: PropTypes.objectOf(
    PropTypes.shape({
      type: PropTypes.string,
      name: PropTypes.string,
      path: PropTypes.path,
      url: PropTypes.string,
      isRoot: PropTypes.bool
    })
  ).isRequired
}

FileSearch.defaultProps = {
  treeData: {}
}

export default FileSearch
