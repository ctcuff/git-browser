/* eslint-disable no-var, semi */

// Similar to the encode/decode workers except in this case,
// we don't care about possible decoding errors
onmessage = function (event) {
  let content = ''

  try {
    content = atob(event.data)
  } catch (e) {
    // Ignored
  }

  postMessage(content)
}
