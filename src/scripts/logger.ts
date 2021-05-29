/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

// This rule is disabled since destructuring doesn't work on process.env
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
      console.warn(...args)
    }
  },

  error(...args: any[]): void {
    if (DEBUG) {
      console.error(...args)
    }
  }
}

export default Logger
