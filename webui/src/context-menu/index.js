var VueContextMenu = require('./index.vue')

VueContextMenu.install = function install(Vue) {
  var component = Vue.component('context-menu', VueContextMenu)
  return component
}

window.VueContextMenu = VueContextMenu

module.exports = module.exports.default = VueContextMenu
