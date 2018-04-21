import Vue from 'vue'
import App from './App'
import DataCenter from 'vue-data-center'
import './index.pcss'
// element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

Vue.use(ElementUI);
Vue.use(DataCenter);

new Vue({
  el: '#app',
  render: h => h(App)
});
