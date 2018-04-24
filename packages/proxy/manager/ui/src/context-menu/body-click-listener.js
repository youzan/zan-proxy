/**
 * When listening for an outside click, we set useCapture = true.
 * This way, we can prevent other click listeners from firing when performing the 'click-out'.
 * If useCapture is set to false, the handlers fire backwards
 */
module.exports = function createBodyClickListener(fn) {
  let isListening = false

  /* === public api ========================================== */
  return {
    get isListening() {
      return isListening
    },

    start(cb) {
      window.addEventListener('click', _onclick, true)
      window.addEventListener('keyup', _onescape, true)
      isListening = true
      if (typeof cb === 'function') cb()
    },

    stop(cb) {
      window.removeEventListener('click', _onclick, true)
      window.removeEventListener('keyup', _onescape, true)
      isListening = false
      if (typeof cb === 'function') cb()
    }
  }

  /* === private helpers ===================================== */
  function _onclick (e) {
    e.preventDefault()
    if (typeof fn === 'function') fn(e)
    try { stop() } catch(e) { /* no prob */ }
  }

  function _onescape (e) {
    if (e.keyCode === 27) _onclick(e)
  }
}
