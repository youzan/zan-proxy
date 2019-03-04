import Vue from 'vue';
import Router from 'vue-router';

import ProjectPath from '@/pages/manager/components/configure/ProjectPath.vue';
import HostFileList from '@/pages/manager/components/host/FileList.vue';
import EditHost from '@/pages/manager/components/host/EditHost.vue';
import CreateHostFile from '@/pages/manager/components/host/CreateFile.vue';
import RuleFileList from '@/pages/manager/components/rule/FileList.vue';
import EditRule from '@/pages/manager/components/rule/EditRule.vue';
import CreateRuleFile from '@/pages/manager/components/rule/CreateFile.vue';
import DataList from '@/pages/manager/components/data/DataList.vue';
import HelpInstall from '@/pages/manager/components/help/Install.vue';
import Plugins from '@/pages/manager/components/plugins/index.vue';

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
