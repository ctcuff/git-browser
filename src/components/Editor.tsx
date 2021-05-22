import '../style/editor.scss'
import React from 'react'
import { AiOutlineEye } from 'react-icons/ai'
import { connect, ConnectedProps } from 'react-redux'
import { parseCSSVar } from '../scripts/util'
import LoadingOverlay from './LoadingOverlay'
import Logger from '../scripts/logger'
import { State } from '../store'
import { Theme } from '../store/actions/settings'

const mapStateToProps = (state: State) => ({
  theme: state.settings.theme
})

const connector = connect(mapStateToProps)

type EditorProps = ConnectedProps<typeof connector> & {
  extension: string
  language: string
  /**
   * Must be base 64 decoded in order to display correctly
   */
  content: string
  onForceRender: (content: string, canEditorRender: boolean) => void
}

type EditorState = {
  isLoading: boolean
  isEncoding: boolean
}

class Editor extends React.Component<EditorProps, EditorState> {
  /**
   * File extensions that cause the component to
   * display the "preview file" button.
   */
  public static previewExtensions = new Set([
    '.adoc',
    '.csv',
    '.gltf',
    '.ipynb',
    '.md',
    '.mdx',
    '.svg',
    '.tsv'
  ])

  /**
   * Files that don't have to be decoded when sent to the FileRenderer
   * since they already display as text when the Editor is rendered.
   * These files will still cause the preview button to be displayed.
   */
  public static textExtensions = new Set([
    '.adoc',
    '.csv',
    '.ipynb',
    '.md',
    '.mdx',
    '.tsv'
  ])

  /**
   * Files that will always be displayed by the FileRenderer component.
   * This allows us to avoid unnecessarily decoding a file.
   */
  public static illegalExtensions = new Set([
    '.aac',
    '.apng',
    '.avif',
    '.bmp',
    '.doc',
    '.docx',
    '.gif',
    '.glb',
    '.ico',
    '.jfif',
    '.jpeg',
    '.jpg',
    '.mp3',
    '.mp4',
    '.ogg',
    '.otf',
    '.pdf',
    '.pjp',
    '.pjpeg',
    '.png',
    '.ppt',
    '.pptx',
    '.psd',
    '.ttf',
    // .wasm is an exception. This file type will be decompiled and
    // displayed as text in an editor through the WasmRenderer component.
    '.wasm',
    '.wav',
    '.webm',
    '.webp',
    '.woff',
    '.woff2',
    '.zip'
  ])
  private encodeWorker: Worker
  private editorRef: React.RefObject<HTMLDivElement>
  private editor!: import('monaco-editor').editor.IStandaloneCodeEditor
  private monaco!: typeof import('monaco-editor').editor

  constructor(props: EditorProps) {
    super(props)

    this.state = {
      isLoading: false,
      isEncoding: false
    }

    this.encodeWorker = new Worker(
      new URL('../scripts/encode-decode.worker.ts', import.meta.url)
    )

    this.editorRef = React.createRef<HTMLDivElement>()
    this.getEditorTheme = this.getEditorTheme.bind(this)
    this.initEditor = this.initEditor.bind(this)
    this.renderPreviewButton = this.renderPreviewButton.bind(this)
    this.viewZoneCallback = this.viewZoneCallback.bind(this)
    this.forceRenderPreview = this.forceRenderPreview.bind(this)
  }

  componentDidMount(): void {
    this.initEditor()
  }

  componentDidUpdate(prevProps: EditorProps): void {
    const { theme } = this.props
    const colorScheme =
      theme.userTheme === 'theme-auto' ? theme.preferredTheme : theme.userTheme

    if (prevProps.theme.userTheme !== colorScheme) {
      this.monaco?.setTheme(this.getEditorTheme(colorScheme))
    }
  }

  componentWillUnmount(): void {
    this.editor?.dispose()
    this.encodeWorker.terminate()
  }

  getEditorTheme(colorScheme: Theme): string {
    return colorScheme === 'theme-dark' ? 'vs-dark' : 'vs-light'
  }

  viewZoneCallback(
    changeAccessor: import('monaco-editor').editor.IViewZoneChangeAccessor
  ): void {
    changeAccessor.addZone({
      afterLineNumber: 0,
      heightInPx: parseCSSVar('--scrollbar-height'),
      domNode: document.createElement('div')
    })
  }

  async initEditor(): Promise<void> {
    this.setState({ isLoading: true })

    if (!this.editorRef.current) {
      // TODO: ensure that the ref was actually set rather than just returning here
      return
    }

    // monaco editor is loaded asynchronously to prevent unnecessarily
    // bundling all of the editor API when the project is built.
    const { editor: monaco, languages } = await import(
      'monaco-editor/esm/vs/editor/editor.api'
    )

    const languageOpts = {
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true
    }

    const { content, theme, language } = this.props

    // Disables lint warnings and syntax errors for languages
    languages.typescript.typescriptDefaults.setDiagnosticsOptions(languageOpts)
    languages.typescript.javascriptDefaults.setDiagnosticsOptions(languageOpts)
    languages.css.cssDefaults.setDiagnosticsOptions({
      validate: false
    })
    languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false
    })

    const model = monaco.createModel(content, language)
    const editorTheme =
      theme.userTheme === 'theme-auto' ? theme.preferredTheme : theme.userTheme

    this.editor = monaco.create(this.editorRef.current, {
      model,
      quickSuggestions: false,
      readOnly: true,
      minimap: {
        enabled: false
      },
      automaticLayout: true,
      fontSize: 14,
      theme: this.getEditorTheme(editorTheme),
      renderIndentGuides: false
    })

    // Gives the editor a small amount of space before the first line
    // to account for the size of the horizontal tab scrollbar
    this.editor.changeViewZones(this.viewZoneCallback)

    this.monaco = monaco
    this.setState({ isLoading: false })
  }

  // Let the App component know that this file should not
  // be rendered by the editor
  forceRenderPreview(): void {
    if (this.state.isEncoding) {
      return
    }
    const { content, onForceRender, extension } = this.props

    this.setState({
      isEncoding: true,
      isLoading: true
    })

    // This file can be displayed as text so it doesn't have to be decoded
    if (Editor.textExtensions.has(extension)) {
      onForceRender(content, false)
      return
    }

    this.encodeWorker.postMessage({
      message: content,
      type: 'encode'
    })

    this.encodeWorker.onmessage = event => {
      onForceRender(event.data, false)
    }

    this.encodeWorker.onerror = event => {
      Logger.error('Error encoding file', event.message)
      this.setState({
        isLoading: false,
        isEncoding: false
      })
    }
  }

  renderPreviewButton() {
    if (
      !Editor.previewExtensions.has(this.props.extension) ||
      this.state.isLoading
    ) {
      return null
    }

    return (
      <button
        className="file-preview-btn"
        title="Preview file"
        onClick={this.forceRenderPreview}
        type="button"
      >
        <AiOutlineEye />
      </button>
    )
  }

  render() {
    return (
      <div className="monaco-editor-container" ref={this.editorRef}>
        {this.state.isLoading && (
          <LoadingOverlay
            text="Loading viewer..."
            className="editor-loading-overlay"
          />
        )}
        {this.renderPreviewButton()}
      </div>
    )
  }
}

const ConnectedEditor = connector(Editor)

export default ConnectedEditor
