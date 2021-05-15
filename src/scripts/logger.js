/* eslint-disable no-console */
// eslint-disable-next-line prefer-destructuring
const DEBUG = process.env.DEBUG

const Logger = {
  info(...args) {
    if (DEBUG) {
      console.log(...args)
    }
  },

  warn(...args) {
    if (DEBUG) {
      console.warn('WARNING:', ...args)
    }
  },

  error(...args) {
    if (DEBUG) {
      console.error('ERROR:', ...args)
    }
  }
}

export default Logger
