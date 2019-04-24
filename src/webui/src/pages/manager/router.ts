import Vue from 'vue';
import Router from 'vue-router';

import ProjectPath from './components/configure/ProjectPath.vue';
import DataList from './components/data/DataList.vue';
import HelpInstall from './components/help/Install.vue';
import CreateHostFile from './components/host/CreateFile.vue';
import EditHost from './components/host/EditHost.vue';
import HostFileList from './components/host/FileList.vue';
import Plugins from './components/plugins/index.vue';
import CreateRuleFile from './components/rule/CreateFile.vue';
import EditRule from './components/rule/EditRule.vue';
import RuleFileList from './components/rule/FileList.vue';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/projectpath', component: ProjectPath },
    { path: '/hostfilelist', component: HostFileList },
    { path: '/edithost', component: EditHost },
    { path: '/createhostfile', component: CreateHostFile },
    { path: '/rulefilelist', component: RuleFileList },
    { path: '/editrule', component: EditRule },
    { path: '/createrulefile', component: CreateRuleFile },
    { path: '/datalist', component: DataList },
    { path: '/helpinstall', component: HelpInstall, alias: '/' },
    { path: '/plugins', component: Plugins },
  ],
});
