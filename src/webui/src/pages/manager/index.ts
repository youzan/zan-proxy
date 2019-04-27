// element-ui
import ElementUI from 'element-ui';
import 'reflect-metadata';
import Vue from 'vue';
import DataCenter from 'vue-data-center';

import App from './App.vue';
import router from './router';

import 'element-ui/lib/theme-chalk/index.css';
import './iconfont.css';
import './index.scss';

Vue.use(ElementUI);
Vue.use(DataCenter);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});
