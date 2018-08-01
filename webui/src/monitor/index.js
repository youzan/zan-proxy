import Vue from 'vue'
import App from './App'
import DataCenter from 'vue-data-center'
import './index.pcss'
// element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

import VueClipboard from 'vue-clipboard2'

Vue.use(ElementUI);
Vue.use(DataCenter);
Vue.use(VueClipboard);

new Vue({
  el: '#app',
  render: h => h(App)
});
