/* eslint-disable no-var, semi */
import { base64EncodeUnicode } from '../scripts/util'

// Encoding a large file can take time and it blocks the main thread.
// Because of this, we have to encode the file using a worker and post
// the result when it's finished
onmessage = function (event) {
  let content = null

  try {
    content = base64EncodeUnicode(event.data)
  } catch (e) {
    // Ignored
  }

  postMessage(content)
}
