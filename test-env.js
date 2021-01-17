const Environment = require('jest-environment-jsdom')

/**
 * A custom environment to set the TextEncoder/TextDecoder required by
 * The encode/decode util function in `src/scripts/util.js`. This is because JSDOM
 * doesn't have these classes defined in the `global` object.
 */
class TestEnvironment extends Environment {
  async setup() {
    await super.setup()
    if (
      typeof this.global.TextEncoder === 'undefined' ||
      typeof this.global.TextDecoder === 'undefined'
    ) {
      const { TextEncoder, TextDecoder } = require('util')
      this.global.TextEncoder = TextEncoder
      this.global.TextDecoder = TextDecoder
    }
  }
}

module.exports = TestEnvironment
