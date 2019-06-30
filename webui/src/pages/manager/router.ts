import Vue from 'vue';
import Router from 'vue-router';

import CreateHostFile from './components/host/CreateFile.vue';
import EditHost from './components/host/EditHost.vue';
import HostFileList from './components/host/FileList.vue';
import CreateRuleFile from './components/rule/CreateFile.vue';
import EditRule from './components/rule/EditRule.vue';
import RuleFileList from './components/rule/FileList.vue';
import Mock from './pages/mock/index.vue';
import Intro from './pages/intro/index.vue';
import Profile from './pages/profile/index.vue';
import Plugins from './pages/plugins/index.vue';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', component: Intro },
    { path: '/projectpath', component: Profile },
    { path: '/hostfilelist', component: HostFileList },
    { path: '/edithost', component: EditHost },
    { path: '/createhostfile', component: CreateHostFile },
    { path: '/rulefilelist', component: RuleFileList },
    { path: '/editrule', component: EditRule },
    { path: '/createrulefile', component: CreateRuleFile },
    { path: '/mock', component: Mock },
    { path: '/plugins', component: Plugins },
  ],
});
