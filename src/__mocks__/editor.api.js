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
  setTheme: noop
}

const monaco = {
  editor
}

module.exports = monaco
