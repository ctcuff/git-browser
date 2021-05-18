/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// eslint-disable-next-line prefer-destructuring
const DEBUG = process.env.DEBUG

const Logger = {
  info(...args: any[]): void {
    if (DEBUG) {
      console.log(...args)
    }
  },

  warn(...args: any[]): void {
    if (DEBUG) {
      console.warn('WARNING:', ...args)
    }
  },

  error(...args: any[]): void {
    if (DEBUG) {
      console.error('ERROR:', ...args)
    }
  }
}

export default Logger
