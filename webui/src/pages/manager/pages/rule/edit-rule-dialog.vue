<template>
  <el-dialog
    title="编写规则"
    @close="cancel"
    :visible.sync="dialogVisible"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form :model="rule" label-width="80px">
      <el-form-item label="请求方法">
        <el-select v-model="rule.method" placeholder="请选择">
          <el-option v-for="item in methodlist" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="URL特征">
        <el-input
          v-model.trim="rule.match"
          auto-complete="off"
          placeholder="填写要拦截的url中部分连续的字符串，或者匹配要拦截url的正则表达式"
        />
      </el-form-item>
      <el-form-item label="规则描述">
        <el-input v-model="rule.name" auto-complete="off" placeholder="规则说明，写一段文字，方便记忆这个规则的作用" />
      </el-form-item>
      <el-form-item label="请求动作">
        <div class="action-container" v-for="(action, index) in rule.actionList" :key="index">
          <rule-action :action="action" :remote="isRemote" />
          <el-tooltip class="item" effect="dark" content="删除" placement="right">
            <el-button type="danger" icon="el-icon-minus" size="mini" @click="removeAction(index)"></el-button>
          </el-tooltip>
        </div>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="addAction">添加请求动作</el-button>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="saveRule">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import { IRuleFile, IRule } from '@core/types/rule';
import { cloneDeep } from 'lodash';
import uuidV4 from 'uuid/v4';
import RuleAction from './rule-action.vue';

function newAction() {
  return {
    type: 'redirect',
    data: {
      target: '',
      dataId: '', //返回数据文件的id
      headerKey: '',
      headerValue: '',
    },
  };
}

function newRule() {
  let defaultRule: IRule = {
    key: uuidV4(),
    method: '',
    match: '',
    name: '',
    checked: true,
    actionList: [newAction()],
  };
  return defaultRule;
}

@Component({
  components: {
    'rule-action': RuleAction,
  },
  data(this: EditRuleDialog) {
    const roleToClone = this.initRule || newRule();
    return {
      rule: cloneDeep(roleToClone),
      methodlist: [
        { value: '', label: '所有' },
        { value: 'get', label: 'GET' },
        { value: 'post', label: 'POST' },
        { value: 'put', label: 'PUT' },
        { value: 'patch', label: 'PATCH' },
        { value: 'delete', label: 'DELETE' },
      ],
    };
  },
})
export default class EditRuleDialog extends Vue {
  rule: IRule;

  @Prop({
    type: Boolean,
  })
  visible: boolean;

  @Prop({
    type: Object,
  })
  initRule: IRule;

  @Prop({
    type: Function,
  })
  save: (rule: IRule) => void;

  @Prop({
    type: Function,
  })
  cancel: () => void;

  @Prop({
    type: Boolean,
  })
  isRemote: boolean;

  get dialogVisible() {
    return this.visible;
  }

  set dialogVisible(val: boolean) {
    if (!val) {
      this.cancel();
    }
  }

  addAction() {
    this.rule.actionList.push(newAction());
  }

  removeAction(index: number) {
    this.rule.actionList.splice(index, 1);
    if (!this.rule.actionList.length) {
      this.addAction();
    }
  }

  saveRule() {
    this.save(this.rule);
  }

  @Watch('visible')
  onVisibleChange(val: boolean) {
    if (val) {
      const ruleToClone = this.initRule || newRule();
      this.rule = cloneDeep(ruleToClone);
    }
  }
}
</script>

<style lang="scss" scoped>
.action-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
</style>
