// monaco editor has to be mocked for tests to work
// https://github.com/Microsoft/monaco-editor/issues/996

const editor = {
  create() {
    return this
  },
  getModel: () => ({
    dispose: jest.fn(),
    setValue: jest.fn()
  }),
  createModel: jest.fn(),
  dispose: jest.fn(),
  setModelLanguage: jest.fn(),
  setTheme: jest.fn(),
  changeViewZones: jest.fn()
}

const languages = {
  typescript: {
    typescriptDefaults: {
      setDiagnosticsOptions: jest.fn()
    },
    javascriptDefaults: {
      setDiagnosticsOptions: jest.fn()
    }
  },
  css: {
    cssDefaults: {
      setDiagnosticsOptions: jest.fn()
    }
  },
  json: {
    jsonDefaults: {
      setDiagnosticsOptions: jest.fn()
    }
  }
}

export { editor, languages }
