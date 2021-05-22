/* eslint-disable */
import { base64DecodeUnicode, base64EncodeUnicode } from './util'

type MessageEventOpts = {
  message: string
  type: 'encode' | 'decode' | 'convertToArrayBuffer'
  raw?: boolean
}

function encode(content: string, raw: boolean): string | null {
  try {
    return base64EncodeUnicode(content, raw)
  } catch (err) {
    return null
  }
}

function decode(content: string, raw: boolean): string | null {
  try {
    return base64DecodeUnicode(content, raw)
  } catch (err) {
    return null
  }
}

/**
 * Takes a base 64 encoded string and converts it into a Uint8Array
 */
function convertToUint8Array(str: string): Uint8Array | null {
  try {
    const decodedString = decode(str, true)!
    const bytes: number[] = new Array(decodedString.length)

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
 */
self.onmessage = function onMessage(event: MessageEvent<MessageEventOpts>) {
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
      // The destination for post message is implicit so the
      // target origin doesn't need to be passed to postMessage
      // @ts-ignore
      self.postMessage(buffer)
      return
    }
    default:
      throw new Error(`Invalid type ${type}'`)
  }
  // @ts-ignore
  self.postMessage(content)
}
