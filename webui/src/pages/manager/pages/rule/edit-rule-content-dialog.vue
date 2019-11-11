<template>
  <el-dialog
    title="编辑"
    :visible.sync="dialogVisible"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form>
      <el-form-item label="规则集名称" label-width="120px">
        <el-input v-model="name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="规则集描述" label-width="120px">
        <el-input type="textarea" v-model="description" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="ok(name, description)">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import { IRuleFile, IRule } from '@core/types/rule';

@Component
export default class EditRuleNameDialog extends Vue {
  name = '';
  description = '';

  @Prop({
    type: Boolean,
  })
  visible: boolean;

  @Prop({
    type: Function,
  })
  ok: () => void;

  @Prop({
    type: Function,
  })
  cancel: () => void;

  @Prop({
    type: String,
    default: '',
  })
  defaultName: string;

  @Prop({
    type: String,
    default: '',
  })
  defaultDescription: string;

  get dialogVisible() {
    return this.visible;
  }

  set dialogVisible(val: boolean) {
    if (!val) {
      this.cancel();
    }
  }

  @Watch('defaultName')
  onDefaultNameChange(value: string) {
    this.name = value;
  }

  @Watch('defaultDescription')
  onDefaultDescriptionChange(value: string) {
    this.description = value;
  }
}
</script>
