<template>
  <div class="main-wrapper">
    <!-- 顶部导航 -->
    <header class="head-nav">
      <span class="dropdown-label">Host规则：</span>
      <el-dropdown trigger="click" :hide-on-click="false" @command="selectHostFile">
        <el-button type="text">
          {{ profile.enableHost ? selectedHost.join(', ') : '禁用' }}
          <i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- host文件 -->
          <el-dropdown-item v-if="profile.enableHost" command="__disabled__">禁用</el-dropdown-item>
          <el-dropdown-item v-else command="__enabled__">启用</el-dropdown-item>
          <el-dropdown-item
            v-for="(hostFile, index) in hostFileList"
            :key="index"
            :command="hostFile.name"
            :disabled="!profile.enableHost"
          >
            {{ hostFile.name }}
            <i class="el-icon-check" v-if="hostFile.checked" />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span class="dropdown-label">转发规则：</span>
      <el-dropdown trigger="click" :hide-on-click="false" @command="selectRuleFile">
        <el-button type="text">
          {{ profile.enableRule ? selectedRuleFiles.join(', ') : '禁用' }}
          <i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- rule文件 -->
          <el-dropdown-item v-if="profile.enableRule" command="__disabled__">禁用</el-dropdown-item>
          <el-dropdown-item v-else command="__enabled__">启用</el-dropdown-item>
          <el-dropdown-item
            v-for="(ruleFile, index) in ruleFileList"
            :key="index"
            :command="ruleFile.name"
            :disabled="!profile.enableRule"
          >
            {{ ruleFile.name }}
            <i class="el-icon-check" v-if="ruleFile.checked" />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </header>

    <!-- 正文 -->
    <div class="left-fixed-right-auto">
      <div class="left">
        <left-menu />
      </div>
      <div class="right">
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import forEach from 'lodash/forEach';
import { Message } from 'element-ui';
import LeftMenu from './components/common/LeftMenu.vue';
import * as hostApi from './api/host';
import * as ruleApi from './api/rule';
import * as profileApi from './api/profile';
import io from 'socket.io-client';
import { IHostFile } from '@core/types/host';
import { IRuleFile } from '@core/types/rule';
import { IMockRecord } from '@core/types/mock';
import { IProfile } from '@core/types/profile';
import { State } from 'vuex-class';
import { AxiosResponse } from 'axios';
import { profileModule, mockModule, hostModule, ruleModule } from './store';

@Component({
  components: {
    'left-menu': LeftMenu,
  },
})
export default class App extends Vue {
  // host文件列表
  @hostModule.State('list')
  hostFileList: IHostFile[];

  // rule文件列表
  @ruleModule.State('list')
  ruleFileList: IRuleFile[];

  @profileModule.State
  profile: IProfile;

  get selectedHost() {
    return this.hostFileList.filter(h => h.checked).map(h => h.name);
  }
  get selectedRuleFiles() {
    return this.ruleFileList.filter(f => f.checked).map(f => f.name);
  }

  async selectHostFile(command: string) {
    if (command === '__disabled__') {
      return await profileApi.toggleHost(false);
    }
    if (command === '__enabled__') {
      return await profileApi.toggleHost(true);
    }
    try {
      const hostFile = this.hostFileList.find(h => h.name === command);
      if (hostFile) {
        await hostApi.toggleHost(hostFile.name, !hostFile.checked);
      }
    } catch (err) {
      this.$message.error(err);
    }
  }

  async selectRuleFile(command: string) {
    // panama-false
    if (command === '__disabled__') {
      return profileApi.toggleRule(false);
    }
    if (command === '__enabled__') {
      return profileApi.toggleRule(true);
    }
    try {
      const ruleFile = this.ruleFileList.find(r => r.name === command);
      if (ruleFile) {
        await ruleApi.toggleRule(ruleFile.name, !ruleFile.checked);
      }
    } catch (err) {
      this.$message.error(err);
    }
  }

  @profileModule.Mutation('update')
  updateProfile: (profile: IProfile) => void;

  @mockModule.Mutation('update')
  updateMockList: (dataList: IMockRecord[]) => void;

  @hostModule.Mutation('update')
  updateHostList: (hostList: IHostFile[]) => void;

  @ruleModule.Mutation('update')
  updateRuleList: (ruleList: IRuleFile[]) => void;

  created() {
    var socket = io('/manager');

    socket.on('profile', (profile: IProfile) => {
      this.updateProfile(profile);
    });

    socket.on('hostFileList', (data: IHostFile[]) => {
      this.updateHostList(data);
    });

    socket.on('ruleFileList', (data: IRuleFile[]) => {
      this.updateRuleList(data);
    });

    socket.on('mockDataList', (data: IMockRecord[]) => {
      this.updateMockList(data);
    });
  }
}
</script>

<style lang="scss" scoped>
.dropdown-label {
  color: #333333;
  font-size: 14px;
}
</style>

<style lang="scss">
.el-dropdown-menu {
  max-height: 400px;
  overflow-y: auto;
}
</style>
