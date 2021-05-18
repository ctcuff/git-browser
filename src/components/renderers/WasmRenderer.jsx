import React from 'react'
import PropTypes from 'prop-types'
import Editor from '../Editor'
import Logger from '../../scripts/logger'
import LoadingOverlay from '../LoadingOverlay'
import ErrorOverlay from '../ErrorOverlay'

class WasmRenderer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      webAssemblyText: '',
      hasError: false,
      isLoading: true
    }

    this.init = this.init.bind(this)
    this.loadWasmLibrary = this.loadWasmLibrary.bind(this)
    this.convertToUint8Array = this.convertToUint8Array.bind(this)

    this.rawDecodeWorker = new Worker('../../scripts/encode-decode.worker.ts', {
      type: 'module'
    })
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.rawDecodeWorker.terminate()
  }

  async loadWasmLibrary() {
    try {
      const loadWabt = (await import('wabt')).default
      this.wabt = await loadWabt()
    } catch (err) {
      Logger.error(err)
    }
  }

  async init() {
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

  async convertToUint8Array(content) {
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

WasmRenderer.propTypes = {
  content: PropTypes.string.isRequired
}

export default WasmRenderer
