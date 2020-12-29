/* eslint-disable  no-var */
import { base64DecodeUnicode } from './util'

// Decoding a large file can take time and it blocks the main thread.
// Because of this, we have to decode the file using a worker and post
// the result when it's finished
onmessage = function (event) {
  let content = null

  try {
    content = base64DecodeUnicode(event.data)
  } catch (e) {
    // Ignored
  }

  postMessage(content)
}
