import Vue from 'vue'
import Router from 'vue-router'
import ProjectPath from 'src/manager/components/configure/ProjectPath'

import HostFileList from 'src/manager/components/host/FileList'
import EditHost from 'src/manager/components/host/EditHost'
import CreateHostFile from 'src/manager/components/host/CreateFile'

import RuleFileList from 'src/manager/components/rule/FileList'
import EditRule from 'src/manager/components/rule/EditRule'
import CreateRuleFile from 'src/manager/components/rule/CreateFile'

import DataList from 'src/manager/components/data/DataList'

import HelpInstall from 'src/manager/components/help/Install'

import Plugins from 'src/manager/components/plugins'


Vue.use(Router);

export default new Router({
  routes: [
    {path: '/projectpath',component: ProjectPath},

    {path: '/hostfilelist',component: HostFileList},
    {path: '/edithost',component: EditHost},
    {path: '/createhostfile',component: CreateHostFile},

    {path: '/rulefilelist',component: RuleFileList},
    {path: '/editrule',component: EditRule},
    {path: '/createrulefile',component: CreateRuleFile},

    {path: '/datalist',component: DataList},

    {path: '/helpinstall',component: HelpInstall, alias: '/'},
    
    { path: '/plugins', component: Plugins }
  ]
})
