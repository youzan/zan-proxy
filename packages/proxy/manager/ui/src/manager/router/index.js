import Vue from 'vue'
import Router from 'vue-router'
import Configure from 'src/manager/components/configure/Configure'
import ProjectPath from 'src/manager/components/configure/ProjectPath'

import HostFileList from 'src/manager/components/host/FileList'
import EditHost from 'src/manager/components/host/EditHost'
import CreateHostFile from 'src/manager/components/host/CreateFile'

import RuleFileList from 'src/manager/components/rule/FileList'
import EditRule from 'src/manager/components/rule/EditRule'
import CreateRuleFile from 'src/manager/components/rule/CreateFile'

import Filter from 'src/manager/components/filter/Filter'

import DataList from 'src/manager/components/data/DataList'

import HelpInstall from 'src/manager/components/help/Install'

import PluginManager from 'src/manager/components/pluginManager/pluginManager'


Vue.use(Router);

export default new Router({
  routes: [
    {path: '/configure',component: Configure},
    {path: '/projectpath',component: ProjectPath},

    {path: '/hostfilelist',component: HostFileList},
    {path: '/edithost',component: EditHost},
    {path: '/createhostfile',component: CreateHostFile},

    {path: '/rulefilelist',component: RuleFileList},
    {path: '/editrule',component: EditRule},
    {path: '/createrulefile',component: CreateRuleFile},

    {path: '/filter',component: Filter},

    {path: '/datalist',component: DataList},

    {path: '/helpinstall',component: HelpInstall, alias: '/'},
    
    { path: '/pluginmanager', component: PluginManager }
  ]
})
