import Vue from 'vue'
import App from './App'
import DataCenter from 'vue-data-center'

// element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

Vue.use(ElementUI);
Vue.use(DataCenter);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
});
