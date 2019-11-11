<template>
  <div class="plugins-page">
    <div class="main-content__title">插件管理</div>
    <div class="list">
      <plugin-item
        v-for="p in plugins"
        :key="p.name"
        :plugin="p"
        :delete="deletePlugin"
        :update="updatePlugin"
        :setDisabled="setPluginDisabled"
      />
      <add-btn :add="addPlugin" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import axios from 'axios';
import { Message } from 'element-ui';
import * as api from '../../api/plugins';
import { IClientPluginInfo } from './types';

import PluginItem from './plugin-item.vue';
import AddBtn from './add-btn.vue';

@Component({
  components: {
    'plugin-item': PluginItem,
    'add-btn': AddBtn,
  },
})
export default class PluginPage extends Vue {
  plugins: IClientPluginInfo[] = [];

  /**
   * 获取插件列表
   */
  fetchPluginList() {
    return axios.get<IClientPluginInfo[]>('/plugins/list').then(res => {
      this.plugins = res.data;
    });
  }

  /**
   * 删除插件
   */
  async deletePlugin(name: string) {
    const loading = this.$loading({
      lock: true,
      text: '删除中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      await api.removePlugin({ name });
      Message.success('删除成功，重启后生效');
      await this.fetchPluginList();
    } catch {
      Message.error('删除失败，请重试');
    } finally {
      loading.close();
    }
  }

  /**
   * 删除插件
   */
  async updatePlugin(name: string) {
    const loading = this.$loading({
      lock: true,
      text: '升级中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      await api.updatePlugin({ name });
      Message.success('升级成功，重启后生效');
      await this.fetchPluginList();
    } catch {
      Message.error('升级失败，请重试');
    } finally {
      loading.close();
    }
  }

  /**
   * 添加插件
   */
  async addPlugin(name: string, registry: string) {
    const loading = this.$loading({
      lock: true,
      text: '添加中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      await api.addPlugin({ name, registry });
      Message.success('添加成功，重启后生效');
      await this.fetchPluginList();
    } catch {
      Message.error('添加失败，请重试');
    } finally {
      loading.close();
    }
  }

  /**
   * 禁用或启用插件
   */
  async setPluginDisabled(name: string, disabled: boolean) {
    const loading = this.$loading({
      lock: true,
      text: '设置中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      await api.togglePlugin({ name, disabled });
      Message.success('设置成功');
      await this.fetchPluginList();
    } catch {
      Message.error('设置失败，请重试');
    } finally {
      loading.close();
    }
  }

  mounted() {
    this.fetchPluginList();
  }
}
</script>

<style lang="scss" scoped>
.plugins-page {
  .list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .item {
    padding: 20px;
    margin: 0 30px 30px 0;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    background-color: #ffffff;
    width: 300px;
    height: 200px;
    box-sizing: border-box;

    &:hover {
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 8px 8px rgba(0, 0, 0, 0.22);
    }
  }
}
</style>
