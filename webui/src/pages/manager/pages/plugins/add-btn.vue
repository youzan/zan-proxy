<template>
  <div class="add-btn item" @click="showDialog">
    <i class="el-icon-plus"></i>
    <el-dialog
      title="添加插件"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="plugin">
        <el-form-item label="包名" :label-width="formLabelWidth">
          <el-input v-model="plugin.name" auto-complete="off" placeholder="插件包名" />
        </el-form-item>
        <el-form-item label="registry" :label-width="formLabelWidth">
          <el-input v-model="plugin.registry" auto-complete="off" placeholder="https://registry.npmjs.org/"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.stop="hideDialog">取 消</el-button>
        <el-button type="primary" @click="onConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { IClientPluginInfo } from './types';
import { Message } from 'element-ui';

@Component
export default class AddBtn extends Vue {
  @Prop(Function)
  add: (name: string, registry: string) => Promise<Response>;

  dialogVisible: boolean = false;
  plugin = {
    name: '',
    registry: '',
  };
  formLabelWidth = '120px';

  hideDialog() {
    if (this.dialogVisible) {
      this.dialogVisible = false;
    }
  }

  showDialog() {
    if (!this.dialogVisible) {
      this.plugin.name = '';
      this.plugin.registry = '';
      this.dialogVisible = true;
    }
  }

  onConfirm() {
    const { name, registry } = this.plugin;
    if (!name) {
      Message.error('请填写包名');
      return;
    }
    this.add(name, registry).then(() => this.hideDialog());
  }
}
</script>

<style lang="scss">
.add-btn {
  align-items: center;
  justify-content: center;
  display: flex;
}
.add-btn .el-icon-plus {
  line-height: 1;
  font-size: 40px;
  color: #999;
}
.add-btn:hover .el-icon-plus {
  color: #409eff;
}
</style>
