// element-ui
import ElementUI from 'element-ui';
import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';

import App from './App.vue';
import store from './store';

import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
Vue.use(VueClipboard);

new Vue({
  el: '#app',
  render: h => h(App),
  store,
});
