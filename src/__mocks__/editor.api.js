// monaco editor has to be mocked for tests to work
// https://github.com/Microsoft/monaco-editor/issues/996

const noop = () => {}

const editor = {
  create() {
    return this
  },
  getModel: () => ({
    dispose: noop,
    setValue: noop
  }),
  createModel: noop,
  dispose: noop,
  setModelLanguage: noop,
  setTheme: noop,
  changeViewZones: noop
}

const languages = {
  typescript: {
    typescriptDefaults: {
      setDiagnosticsOptions: noop
    },
    javascriptDefaults: {
      setDiagnosticsOptions: noop
    }
  },
  css: {
    cssDefaults: {
      setDiagnosticsOptions: noop
    }
  },
  json: {
    jsonDefaults: {
      setDiagnosticsOptions: noop
    }
  }
}

module.exports = { editor, languages }
