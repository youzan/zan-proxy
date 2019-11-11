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
        <el-button size="small" type="primary" icon="el-icon-setting" @click.stop>{{ statusText }}</el-button>
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
      <el-popover placement="bottom" v-model="updatePopVisible">
        <p>确定升级该插件吗？</p>
        <div class="confirm-line">
          <el-button size="mini" @click="updatePopVisible = false">取消</el-button>
          <el-button size="mini" type="success" @click="onUpdate">确定</el-button>
        </div>
        <el-button size="small" slot="reference" type="success" icon="el-icon-upload" @click.stop>升级</el-button>
      </el-popover>
      <el-popover placement="bottom" v-model="deletePopVisible">
        <p>确定删除该插件吗？</p>
        <div class="confirm-line">
          <el-button size="mini" @click="deletePopVisible = false">取消</el-button>
          <el-button size="mini" type="danger" @click="onDelete">确定</el-button>
        </div>
        <el-button size="small" slot="reference" type="danger" icon="el-icon-delete" @click.stop>卸载</el-button>
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
  update: (name: string) => Promise<void>;

  @Prop(Function)
  setDisabled: (name: string, disabled: boolean) => Promise<void>;

  updatePopVisible: boolean = false;
  deletePopVisible: boolean = false;

  get statusText() {
    if (this.plugin.disabled) {
      return '已禁用';
    }
    return '已启用';
  }

  openPluginPage() {
    window.open(`/plugins/${this.plugin.name}/`, '_blank');
  }

  onDelete() {
    this.deletePopVisible = false;
    this.delete(this.plugin.name);
  }

  onUpdate() {
    this.updatePopVisible = false;
    this.update(this.plugin.name);
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
    margin-bottom: 16px;
  }

  .body {
    flex: 1;
  }

  .name {
    font-size: 16px;
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
    margin-left: 8px;
  }
}

.confirm-line {
  margin-top: 8px;
  text-align: right;
}
</style>
<style lang="scss">
.icon-checked {
  margin-left: 8px;
  color: #67c23a;
}
</style>
