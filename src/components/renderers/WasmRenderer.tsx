import React from 'react'
import Editor from '../Editor'
import Logger from '../../scripts/logger'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'

type WasmRendererProps = {
  content: string
}

type WasmRendererState = {
  webAssemblyText: string
  hasError: boolean
  isLoading: boolean
}
class WasmRenderer extends React.Component<
  WasmRendererProps,
  WasmRendererState
> {
  private rawDecodeWorker: Worker
  private wabt!: import('wabt').WabtModule

  constructor(props: WasmRendererProps) {
    super(props)

    this.state = {
      webAssemblyText: '',
      hasError: false,
      isLoading: true
    }

    this.init = this.init.bind(this)
    this.loadWasmLibrary = this.loadWasmLibrary.bind(this)
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

  async loadWasmLibrary(): Promise<void> {
    try {
      const loadWabt = (await import('wabt')).default
      this.wabt = await loadWabt()
    } catch (err) {
      Logger.error(err)
    }
  }

  async init(): Promise<void> {
    this.setState({
      isLoading: true,
      hasError: false
    })

    try {
      await this.loadWasmLibrary()

      const buffer = await this.convertToUint8Array(this.props.content)
      const wasmModule = this.wabt.readWasm(buffer, {
        readDebugNames: false
      })

      const wast = wasmModule.toText({
        foldExprs: false,
        inlineExport: false
      })

      this.setState({
        isLoading: false,
        hasError: false,
        webAssemblyText: wast
      })
    } catch (err) {
      Logger.error(err)

      this.setState({
        isLoading: false,
        hasError: true
      })
    }
  }

  async convertToUint8Array(content: string): Promise<Uint8Array> {
    this.rawDecodeWorker.postMessage({
      message: content,
      type: 'convertToArrayBuffer'
    })

    return new Promise((resolve, reject) => {
      this.rawDecodeWorker.onmessage = event => resolve(event.data)
      this.rawDecodeWorker.onerror = err => reject(err)
    })
  }

  render(): JSX.Element {
    const { isLoading, hasError, webAssemblyText } = this.state

    if (isLoading) {
      return <LoadingOverlay text="Decompiling assembly..." />
    }

    if (hasError) {
      return (
        <ErrorOverlay
          message="An error occurred while decompiling."
          retryMessage="Retry"
          onRetryClick={this.init}
        />
      )
    }

    return (
      <Editor
        extension="wasm"
        content={webAssemblyText}
        language="txt"
        onForceRender={() => {}}
      />
    )
  }
}

export default WasmRenderer
