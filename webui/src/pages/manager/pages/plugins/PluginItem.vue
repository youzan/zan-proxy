<template>
  <div class="plugin item" @click="openPluginPage">
    <div class="header">
      <span class="name">{{ plugin.name }}</span>
      <span class="version">{{ plugin.version }}</span>
    </div>
    <div class="body">
      <p class="description">{{ plugin.description }}</p>
    </div>
    <div class="footer">
      <el-dropdown @command="toggleDisable">
        <el-button type="primary" icon="el-icon-setting" @click.stop>{{ disabledText }}</el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="false">
            启用
            <i class="el-icon-check icon-checked" v-if="!plugin.disabled"></i>
          </el-dropdown-item>
          <el-dropdown-item :command="true">
            禁用
            <i class="el-icon-check icon-checked" v-if="plugin.disabled"></i>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-popover placement="bottom" v-model="popVisible">
        <p>确定删除该插件吗？</p>
        <div class="delete-confirm-lien">
          <el-button size="mini" @click="popVisible = false">取消</el-button>
          <el-button type="danger" size="mini" @click="onDelete">确定</el-button>
        </div>
        <el-button slot="reference" type="danger" icon="el-icon-delete" @click.stop>卸载</el-button>
      </el-popover>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { IClientPluginInfo } from './types';

@Component
export default class PluginItem extends Vue {
  @Prop(Object)
  plugin: IClientPluginInfo;

  @Prop(Function)
  delete: (name: string) => Promise<void>;

  @Prop(Function)
  setDisabled: (name: string, disabled: boolean) => Promise<void>;

  popVisible: boolean = false;

  get disabledText() {
    if (this.plugin.disabled) {
      return '已禁用';
    }
    return '已启用';
  }

  openPluginPage() {
    window.open(`/plugins/${this.plugin.name}/`, '_blank');
  }

  onDelete() {
    this.popVisible = false;
    this.delete(this.plugin.name);
  }

  toggleDisable(disabled: boolean) {
    this.setDisabled(this.plugin.name, disabled);
  }
}
</script>

<style lang="scss" scoped>
.plugin {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .body {
    flex: 1;
  }

  .name {
    font-size: 18px;
    color: #333333;
  }

  .version {
    font-size: 12px;
    color: #aaaaaa;
  }

  .description {
    font-size: 14px;
    color: #999999;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: row;
  }
  .footer .el-button {
    margin-left: 10px;
  }
}

.delete-confirm-lien {
  margin-top: 8px;
  text-align: right;
}
</style>
<style lang="scss">
.icon-checked {
  margin-left: 10px;
  color: #67c23a;
}
</style>
