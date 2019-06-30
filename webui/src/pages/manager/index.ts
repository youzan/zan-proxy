// element-ui
import ElementUI from 'element-ui';
import 'reflect-metadata';
import Vue from 'vue';
import DataCenter from 'vue-data-center';

import App from './App.vue';
import router from './router';
import store from './store';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/display/fullscreen.css';
import 'codemirror/addon/display/fullscreen';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';

import 'element-ui/lib/theme-chalk/index.css';
import './iconfont.css';
import './index.scss';

Vue.use(ElementUI);
Vue.use(DataCenter);

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
