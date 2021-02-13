import '../../style/renderers/zip-renderer.scss'
import React from 'react'
import PropTypes from 'prop-types'
import Tree from '../../scripts/tree'
import FileExplorer from '../FileExplorer'
import LoadingOverlay from '../LoadingOverlay'
import Logger from '../../scripts/logger'
import ErrorOverlay from '../ErrorOverlay'

class ZipRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      hasError: false,
      tree: {}
    }

    this.importLibrary = this.importLibrary.bind(this)
    this.init = this.init.bind(this)
    this.parseZip = this.parseZip.bind(this)
  }

  componentDidMount() {
    this.init()
  }

  async init() {
    this.setState({
      isLoading: true,
      hasError: false
    })

    try {
      await this.importLibrary()
      const tree = await this.parseZip(this.props.content)

      this.setState({
        tree,
        isLoading: false
      })
    } catch (err) {
      Logger.error(err)

      this.setState({
        isLoading: false,
        hasError: true
      })
    }
  }

  async importLibrary() {
    try {
      const JSZip = await import('jszip')
      this.JSZip = JSZip.default
    } catch (err) {
      Logger.error('Error importing JSZip', err)
    }
  }

  async parseZip(content) {
    const { files } = await this.JSZip.loadAsync(content, {
      base64: true,
      createFolders: true
    })

    const treeData = []

    Object.keys(files).forEach(key => {
      const file = files[key]
      // Folders that end with '/' aren't parsed correctly
      // by Tree.treeify so we need to remove it
      const fileName = file.name.endsWith('/')
        ? file.name.slice(0, -1)
        : file.name

      treeData.push({
        path: fileName,
        type: file.dir ? 'tree' : 'blob',
        open: true
      })
    })

    return Tree.treeify(treeData)
  }

  render() {
    const { isLoading, hasError, tree } = this.state

    if (isLoading) {
      return <LoadingOverlay text="Extracting zip..." />
    }

    if (hasError) {
      return (
        <ErrorOverlay
          message="Error extracting zip."
          retryMessage="Retry"
          onRetryClick={this.init}
        />
      )
    }

    if (Object.keys(tree).length === 0) {
      return <ErrorOverlay message="This zip is empty" showIcon={false} />
    }

    return (
      <div className="zip-renderer">
        <div className="container">
          <h2>Zip Explorer</h2>
          <p>Here&apos;s what this zip contains</p>
          <FileExplorer nodes={tree} updateURLOnClick={false} />
        </div>
      </div>
    )
  }
}

ZipRenderer.propTypes = {
  content: PropTypes.string.isRequired
}

export default ZipRenderer
