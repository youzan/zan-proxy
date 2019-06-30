<template>
  <div class="main-wrapper">
    <!-- 顶部导航 -->
    <header class="head-nav">
      <span class="dropdown-label">Host 设置：</span>
      <el-dropdown trigger="click" :hide-on-click="false" @command="selectHostFile">
        <el-button type="text">
          {{ hostState ? selectedHost.join('，') : '禁用' }}
          <i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- host文件 -->
          <el-dropdown-item v-if="profile.enableHost" command="__disabled__">禁用</el-dropdown-item>
          <el-dropdown-item v-if="!profile.enableHost" command="__enabled__">启用</el-dropdown-item>
          <!-- eslint-disable -->
          <el-dropdown-item
            v-for="(hostfile, index) in hostFileList"
            :key="index"
            :command="hostfile.name"
            :disabled="!profile.enableHost"
          >
            {{ hostfile.name }}
            <i class="el-icon-check" v-if="hostfile.checked"/>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span class="dropdown-label">请求转发：</span>
      <el-dropdown trigger="click" :hide-on-click="false" @command="selectRuleFile">
        <el-button type="text">
          {{ ruleState ? selectedRuleFiles.join('，') : '禁用' }}
          <i
            class="el-icon-caret-bottom el-icon--right"
          />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- rule文件 -->
          <el-dropdown-item v-if="profile.enableRule" command="__disabled__">禁用</el-dropdown-item>
          <el-dropdown-item v-if="!profile.enableRule" command="__enabled__">启用</el-dropdown-item>
          <el-dropdown-item
            v-for="(rulefile, index) in ruleFileList"
            :key="index"
            :command="rulefile.name + '-%-' + rulefile.checked"
            :disabled="!profile.enableRule"
          >
            {{ rulefile.name }}
            <i class="el-icon-check" v-if="rulefile.checked"/>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </header>

    <!-- 正文 -->
    <div class="left-fixed-right-auto">
      <div class="left">
        <left-menu/>
      </div>
      <div class="right">
        <div class="main-content">
          <router-view/>
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
import { profileModule, mockModule } from './store';

@Component({
  components: {
    'left-menu': LeftMenu,
  },
})
export default class App extends Vue {
  isDataCenter = true;

  // 生效的规则
  rule: string[] = [];
  // host文件列表
  hostFileList: IHostFile[] = [];
  // rule文件列表
  ruleFileList: IRuleFile[] = [];

  @profileModule.State
  profile: IProfile;

  get ruleState() {
    return this.profile.enableRule || false;
  }
  get hostState() {
    return this.profile.enableHost || false;
  }
  get selectedHost() {
    return this.hostFileList.filter(h => h.checked).map(h => h.name);
  }
  get selectedRuleFiles() {
    return this.ruleFileList.filter(f => f.checked).map(f => f.name);
  }

  async selectHostFile(command: string) {
    let name = command;
    if (command === '__disabled__') {
      return await profileApi.disableHost();
    }
    if (command === '__enabled__') {
      return await profileApi.enableHost();
    }
    hostApi.debouncedUseFile(name, (response: AxiosResponse) => {
      var serverData = response.data;
      if (serverData.code == 0) {
        this.$message({
          type: 'success',
          message: '设置成功!',
        });
      } else {
        this.$message.error(`出错了,请刷新页面，${serverData.msg}`);
      }
    });
  }

  selectRuleFile(command: string) {
    // panama-false
    if (command === '__disabled__') {
      return profileApi.disableRule();
    }
    if (command === '__enabled__') {
      return profileApi.enableRule();
    }
    let kv = command.split('-%-');
    ruleApi.setFileCheckStatus(kv[0], kv[1] == 'false').then(response => {
      var serverData = response.data;
      if (serverData.code != 0) {
        this.$message.error(`出错了，${serverData.msg}`);
      }
    });
  }

  @profileModule.Mutation('update')
  updateProfile: (profile: IProfile) => void;

  @mockModule.Mutation('update')
  updateMockData: (dataList: IMockRecord[]) => void;

  created() {
    var socket = io('/manager');

    socket.on('profile', (profile: IProfile) => {
      this.updateProfile(profile);
    });

    socket.on('hostfilelist', (data: IHostFile[]) => {
      this.hostFileList = data;
    });

    socket.on('rulefilelist', (data: IRuleFile[]) => {
      this.ruleFileList = data;
    });

    socket.on('mockDataList', (data: IMockRecord[]) => {
      this.updateMockData(data);
    });
  }
}
</script>

<style lang="scss">
.el-dropdown-menu {
  max-height: 400px;
  overflow-y: auto;
}
.dropdown-label {
  color: #333333;
  font-size: 14px;
}
</style>
