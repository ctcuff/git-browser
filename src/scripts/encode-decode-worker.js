/* eslint-disable */
import { base64DecodeUnicode, base64EncodeUnicode } from './util'

function encode(content, raw) {
  try {
    return base64EncodeUnicode(content, raw)
  } catch (e) {
    return null
  }
}

function decode(content, raw) {
  try {
    return base64DecodeUnicode(content, raw)
  } catch (e) {
    return null
  }
}

/**
 * Encoding/decoding a large string can take time and it blocks the main thread.
 * Because of this, we have to encode/decode it using a worker and post
 * the result when it's finished.
 *
 * This worker takes an object as a message:
 *```
 * {
 *  type: 'encode' | 'decode',
 *  message: 'Some string'
 *  raw: true | false,
 * }
 * ```
 */
self.onmessage = function (event) {
  const { message, type, raw = false } = event.data
  let content = null

  switch (type.toLowerCase()) {
    case 'encode':
      content = encode(message, raw)
      break
    case 'decode':
      content = decode(message, raw)
      break
    default:
      throw new Error(
        `Invalid type ${type}. Must be either 'encode' or 'decode'`
      )
  }

  self.postMessage(content)
}
