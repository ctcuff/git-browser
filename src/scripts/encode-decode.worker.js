/* eslint-disable */
import { base64DecodeUnicode, base64EncodeUnicode } from './util'

/**
 * @param {string} content The encoded string
 * @param {boolean} raw If true, force encoding with btoa
 * @returns {string?}
 */
function encode(content, raw) {
  try {
    return base64EncodeUnicode(content, raw)
  } catch (err) {
    return null
  }
}

/**
 * @param {string} content The encoded string
 * @param {boolean} raw If true, force decoding with atob
 * @returns {string?}
 */
function decode(content, raw) {
  try {
    return base64DecodeUnicode(content, raw)
  } catch (err) {
    return null
  }
}

/**
 * Takes a base 64 encoded string and converts it into a Uint8Array
 * @param {string} str
 * @returns {Uint8Array?}
 */
function convertToUint8Array(str) {
  try {
    const decodedString = decode(str, true)
    const bytes = new Array(decodedString.length)

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = decodedString.charCodeAt(i)
    }

    return new Uint8Array(bytes)
  } catch (err) {
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
self.onmessage = function onMessage(event) {
  const { message, type, raw = false } = event.data
  let content = null

  switch (type) {
    case 'encode':
      content = encode(message, raw)
      break
    case 'decode':
      content = decode(message, raw)
      break
    case 'convertToArrayBuffer': {
      const buffer = convertToUint8Array(message)
      self.postMessage(buffer)
      return
    }
    default:
      throw new Error(`Invalid type ${type}'`)
  }

  self.postMessage(content)
}
