import Vue from 'vue';
import Router from 'vue-router';

import HostEdit from './pages/host/edit.vue';
import HostList from './pages/host/list.vue';
import Intro from './pages/intro/index.vue';
import Mock from './pages/mock/index.vue';
import OtherSetting from './pages/other-setting/index.vue';
import Plugins from './pages/plugins/index.vue';
import Profile from './pages/profile/index.vue';
import RuleCreate from './pages/rule/create.vue';
import RuleEdit from './pages/rule/edit.vue';
import RuleList from './pages/rule/list.vue';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', redirect: '/intro' },
    { path: '/host', redirect: '/host/list' },
    { path: '/rule', redirect: '/rule/list' },
    { path: '/intro', component: Intro },
    { path: '/profile', component: Profile },
    { path: '/host/list', component: HostList },
    { path: '/host/edit', component: HostEdit },
    { path: '/rule/list', component: RuleList },
    { path: '/rule/edit', component: RuleEdit },
    { path: '/rule/create', component: RuleCreate },
    { path: '/mock', component: Mock },
    { path: '/plugins', component: Plugins },
    { path: '/other-setting', component: OtherSetting },
  ],
});
