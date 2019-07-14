<template>
  <div class="main-wrapper">
    <!-- 顶部导航 -->
    <header class="head-nav">
      <span class="dropdown-label">Host 设置：</span>
      <el-dropdown trigger="click" :hide-on-click="false" @command="selectHostFile">
        <el-button type="text">
          {{ profile.enableHost ? selectedHost.join(',') : '禁用' }}
          <i
            class="el-icon-caret-bottom el-icon--right"
          />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- host文件 -->
          <el-dropdown-item v-if="profile.enableHost" command="__disabled__">禁用</el-dropdown-item>
          <el-dropdown-item v-else command="__enabled__">启用</el-dropdown-item>
          <!-- eslint-disable -->
          <el-dropdown-item
            v-for="(hostfile, index) in hostFileList"
            :key="index"
            :command="hostfile.name"
            :disabled="!profile.enableHost"
          >
            {{ hostfile.name }}
            <i class="el-icon-check" v-if="hostfile.checked" />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span class="dropdown-label">请求转发：</span>
      <el-dropdown trigger="click" :hide-on-click="false" @command="selectRuleFile">
        <el-button type="text">
          {{ profile.enableRule ? selectedRuleFiles.join(',') : '禁用' }}
          <i
            class="el-icon-caret-bottom el-icon--right"
          />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- rule文件 -->
          <el-dropdown-item v-if="profile.enableRule" command="__disabled__">禁用</el-dropdown-item>
          <el-dropdown-item v-else command="__enabled__">启用</el-dropdown-item>
          <el-dropdown-item
            v-for="(rulefile, index) in ruleFileList"
            :key="index"
            :command="rulefile.name + '-%-' + rulefile.checked"
            :disabled="!profile.enableRule"
          >
            {{ rulefile.name }}
            <i class="el-icon-check" v-if="rulefile.checked" />
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
    let name = command;
    if (command === '__disabled__') {
      return await profileApi.toggleHost(false);
    }
    if (command === '__enabled__') {
      return await profileApi.toggleHost(true);
    }
    try {
      await hostApi.toggleFile(name);
      this.$message.success('设置成功!');
    } catch (err) {
      this.$message.error(`出错了,请刷新页面，${err}`);
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
    let kv = command.split('-%-');
    try {
      await ruleApi.toggleRule(kv[0], kv[1] == 'false');
    } catch (err) {
      this.$message.error(`出错了，${err}`);
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
