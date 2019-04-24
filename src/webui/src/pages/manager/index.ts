// element-ui
import ElementUI from 'element-ui';
import Vue from 'vue';
import DataCenter from 'vue-data-center';

import App from './App.vue';
import router from './router';

import 'element-ui/lib/theme-default/index.css';
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

document.addEventListener(
  'keydown',
  function(event) {
    if ((event.ctrlKey || event.metaKey) && event.which === 83) {
      // Save Function
      event.preventDefault();
      return false;
    }
  },
  true,
);
