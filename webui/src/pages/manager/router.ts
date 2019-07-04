import Vue from 'vue';
import Router from 'vue-router';

import CreateRuleFile from './components/rule/CreateFile.vue';
import EditRule from './components/rule/EditRule.vue';
import RuleFileList from './components/rule/FileList.vue';

import HostCreate from './pages/host/create.vue';
import HostEdit from './pages/host/edit.vue';
import HostList from './pages/host/list.vue';
import Mock from './pages/mock/index.vue';
import Intro from './pages/intro/index.vue';
import Profile from './pages/profile/index.vue';
import Plugins from './pages/plugins/index.vue';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', component: Intro },
    { path: '/projectpath', component: Profile },
    { path: '/host/list', component: HostList },
    { path: '/host/create', component: HostCreate },
    { path: '/host/edit', component: HostEdit },
    { path: '/rulefilelist', component: RuleFileList },
    { path: '/editrule', component: EditRule },
    { path: '/createrulefile', component: CreateRuleFile },
    { path: '/mock', component: Mock },
    { path: '/plugins', component: Plugins },
  ],
});
