import 'reflect-metadata';
import 'element-ui/lib/theme-default/index.css';

// element-ui
import ElementUI from 'element-ui';
import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
import DataCenter from 'vue-data-center';

import App from './App.vue';

Vue.use(ElementUI);
Vue.use(DataCenter);
Vue.use(VueClipboard);

new Vue({
  el: '#app',
  render: h => h(App),
});
