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
    this.convertToUint8Array = this.convertToUint8Array.bind(this)

    this.rawDecodeWorker = new Worker('../../scripts/encode-decode.worker.js', {
      type: 'module'
    })
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.rawDecodeWorker.terminate()
  }

  async init() {
    this.setState({
      isLoading: true,
      hasError: false
    })

    try {
      await this.importLibrary()

      // We need to turn the base 64 string into a Uint8Array so
      // that the zip can be parsed by zip.js
      const buffer = await this.convertToUint8Array(this.props.content)
      const tree = await this.parseZip(buffer)

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
      // Need to import from the dist directory so it'll work with webpack
      // https://github.com/gildas-lormeau/zip.js/issues/212#issuecomment-769708718
      this.zip = await import('@zip.js/zip.js/dist/zip-full')
    } catch (err) {
      Logger.error('Error importing zip library', err)
    }
  }

  async parseZip(buffer) {
    const { ZipReader, Uint8ArrayReader } = this.zip

    const uintReader = new Uint8ArrayReader(buffer)
    const reader = new ZipReader(uintReader, { useWebWorkers: true })

    const entries = await reader.getEntries()

    const treeData = entries.map(({ filename, directory }) => {
      // Folders that end with '/' aren't parsed correctly
      // by Tree.treeify so we need to remove any trailing '/'
      const path = filename.endsWith('/') ? filename.slice(0, -1) : filename

      return {
        path,
        type: directory ? 'tree' : 'blob'
      }
    })

    return Tree.treeify(treeData)
  }

  convertToUint8Array(content) {
    this.rawDecodeWorker.postMessage({
      message: content,
      type: 'convertToArrayBuffer'
    })

    return new Promise((resolve, reject) => {
      this.rawDecodeWorker.onmessage = event => resolve(event.data)
      this.rawDecodeWorker.onerror = () =>
        reject(new Error('Error decoding content'))
    })
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
      return <ErrorOverlay message="This zip is empty." />
    }

    return (
      <div className="zip-renderer">
        <div className="container">
          <h2>Zip Explorer</h2>
          <p>
            Here&apos;s what this zip contains (note that this is only a
            preview)
          </p>
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
