import '../../style/renderers/zip-renderer.scss'
import React from 'react'
import Tree, { TreeObject } from '../../scripts/tree'
import FileExplorer from '../FileExplorer'
import LoadingOverlay from '../LoadingOverlay'
import Logger from '../../scripts/logger'
import ErrorOverlay from '../ErrorOverlay'
import { GitHubTreeItem } from '../../@types/github-api'

type ZipRendererProps = {
  /**
   * base64 encoded
   */
  content: string
}

type ZipRendererState = {
  isLoading: boolean
  hasError: boolean
  tree: TreeObject
}

class ZipRenderer extends React.Component<ZipRendererProps, ZipRendererState> {
  private rawDecodeWorker: Worker
  private zip!: typeof import('@zip.js/zip.js')

  constructor(props: ZipRendererProps) {
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

    this.rawDecodeWorker = new Worker(
      new URL('../../scripts/encode-decode.worker.ts', import.meta.url)
    )
  }

  componentDidMount(): void {
    this.init()
  }

  componentWillUnmount(): void {
    this.rawDecodeWorker.terminate()
  }

  async init(): Promise<void> {
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

  async importLibrary(): Promise<void> {
    try {
      // Need to import from the dist directory so it'll work with webpack
      // https://github.com/gildas-lormeau/zip.js/issues/212#issuecomment-769708718.
      // Typescript complains when this library is imported since the type definitions
      // are imported under @zip.js/zip.js
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.zip = await import('@zip.js/zip.js/dist/zip-full')
    } catch (err) {
      Logger.error('Error importing zip library', err)
    }
  }

  async parseZip(buffer: Uint8Array): Promise<TreeObject> {
    const { ZipReader, Uint8ArrayReader } = this.zip

    const uintReader = new Uint8ArrayReader(buffer)
    const reader = new ZipReader(uintReader, { useWebWorkers: true })

    const entries = await reader.getEntries()

    const treeData: GitHubTreeItem[] = entries.map(
      ({ filename, directory }) => {
        // Folders that end with '/' aren't parsed correctly
        // by Tree.treeify so we need to remove any trailing '/'
        const path = filename.endsWith('/') ? filename.slice(0, -1) : filename

        return {
          path,
          type: directory ? 'tree' : 'blob'
        }
      }
    ) as GitHubTreeItem[]

    return Tree.treeify(treeData)
  }

  convertToUint8Array(content: string): Promise<Uint8Array> {
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

  render(): JSX.Element {
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
          <FileExplorer nodes={tree} />
        </div>
      </div>
    )
  }
}

export default ZipRenderer
