import Vue from 'vue'
import DataCenter from 'vue-data-center'
import VueClipboard from 'vue-clipboard2'
// element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

import App from './App.vue'
import './index.scss'

Vue.use(ElementUI);
Vue.use(DataCenter);
Vue.use(VueClipboard);

new Vue({
  el: '#app',
  render: h => h(App)
});
