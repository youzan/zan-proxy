<template>
  <div>
    <div class="main-content__title">
      编辑规则集{{ !loading && `: ${ruleFile.name}` }}
      <el-button-group v-if="!isRemote" class="main-content__action">
        <el-button size="small" @click="openEditRuleInfoDialog">编辑名字/描述</el-button>
        <el-button size="small" @click="addRule">新增规则</el-button>
      </el-button-group>
    </div>
    <p class="tip" v-if="isRemote">该规则集为远程规则集，如需修改，请复制对应规则集。</p>
    <el-table class="rule-edit-table" border row-key="key" align="center" :stripe="true" :data="ruleFile.content">
      <el-table-column prop="checked" label="启用" align="center" width="60">
        <template v-slot="scope">
          <el-tooltip class="item" effect="dark" content="勾选后启动这条规则" placement="left">
            <el-checkbox v-model="scope.row.checked" @change="saveRule"></el-checkbox>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="请求方法" align="center" width="80">
        <template v-slot="scope">
          <span v-if="scope.row.method">{{ scope.row.method }}</span>
          <span v-else>所有</span>
        </template>
      </el-table-column>
      <el-table-column prop="match" label="URL特征" width="200" />
      <el-table-column prop="name" label="描述" />
      <el-table-column label="转发地址">
        <template v-slot="scope">{{ getRedirectTarget(scope.row.actionList) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" :context="_self">
        <template v-slot="scope">
          <div class="actions-container">
            <el-tooltip v-if="!isRemote" class="item" effect="dark" content="编辑" placement="left">
              <el-button icon="el-icon-edit" size="mini" type="primary" @click="dialogEdit(scope.row.key)" />
            </el-tooltip>
            <el-tooltip v-if="!isRemote" class="item" effect="dark" content="删除" placement="top">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="onDeleteRow(scope.row, scope.$index, ruleFile.content)"
              />
            </el-tooltip>
            <el-tooltip v-if="!isRemote" class="item" effect="dark" content="复制" placement="left">
              <el-button
                icon="el-icon-document"
                size="mini"
                @click="onDuplicateRow(scope.row, scope.$index, ruleFile.content)"
              />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="测试规则" placement="left">
              <el-button type="blue" icon="el-icon-search" size="mini" @click="testMatchRuleRequest(scope.row)" />
            </el-tooltip>
            <el-tooltip v-if="!isRemote" class="item" effect="dark" content="提高优先级" placement="left">
              <el-button
                type="blue"
                icon="el-icon-caret-top"
                size="mini"
                :disabled="scope.$index === 0"
                @click="onMoveUpRule(scope.$index)"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 测试正则匹配对话框 -->
    <el-dialog
      title="匹配规则测试(只测试正则匹配，不包含请求方法)"
      :visible.sync="testMatchRuleFormVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="testMatchRuleForm" label-width="120px">
        <el-form-item label="请求url">
          <el-input v-model="testMatchRuleForm.url"></el-input>
        </el-form-item>
        <el-form-item label="匹配条件">
          <el-input v-model="testMatchRuleForm.match"></el-input>
        </el-form-item>
        <el-form-item label="转发路径">
          <el-input v-model="testMatchRuleForm.targetTpl"></el-input>
        </el-form-item>
        <el-form-item label="匹配结果">
          <el-input v-model="testMatchRuleForm.matchRlt" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="最终目标路径">
          <el-input v-model="testMatchRuleForm.targetRlt" :disabled="true"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="testMatchRuleFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="testMatchRule">测试</el-button>
      </div>
    </el-dialog>
    <edit-rule-dialog
      :isRemote="isRemote"
      :visible="dialogVisible"
      :save="dialogSave"
      :cancel="hideEditDialog"
      :initRule="editingRule"
    />
    <edit-rule-config-dialog
      :visible="editRuleConfigDialogVisible"
      :ok="updateRuleInfo"
      :cancel="closeEditRuleNameDialog"
      :defaultName="ruleFile.name"
      :defaultDescription="ruleFile.description"
    />
  </div>
</template>

<script lang="ts">
import * as ruleApi from '../../api/rule';
import Vue from 'vue';
import 'vue-router';
import { ElForm } from 'element-ui/types/form';
import { Message } from 'element-ui';
import { Component, Watch } from 'vue-property-decorator';
import { IRuleFile, IRule, IRuleAction } from '@core/types/rule';
import { MessageBoxInputData, MessageBoxCloseAction } from 'element-ui/types/message-box';
import { ruleModule, mockModule } from '../../store';
import _ from 'lodash';
import uuidV4 from 'uuid/v4';

import EditDialog from './edit-rule-dialog.vue';
import EditRuleConfigDialog from './edit-rule-content-dialog.vue';
import { IMockRecord } from '@core/types/mock';

@Component({
  components: {
    'edit-rule-dialog': EditDialog,
    'edit-rule-config-dialog': EditRuleConfigDialog,
  },
})
export default class RuleEdit extends Vue {
  loading = false;
  ruleFile: IRuleFile = {} as IRuleFile;
  testMatchRuleFormVisible = false;
  testMatchRuleForm = {
    url: '', // 请求url
    match: '', // url匹配规则
    targetTpl: '', // 路径模板， 会用urlReg的匹配结果来替换targetTpl $1 $2
    matchRlt: '', // url匹配结果
    targetRlt: '', // 路径匹配结果
  };
  dialogVisible = false;
  editRuleConfigDialogVisible = false; // 编辑规则集名称弹窗
  editRuleKey: string | null = null;

  @mockModule.State('list')
  mockList: IMockRecord[];

  get name() {
    return this.$route.query.name as string;
  }

  /**
   * 是否是远程规则
   */
  get isRemote() {
    const { loading, ruleFile } = this;
    return !loading && ruleFile.meta && ruleFile.meta.remote;
  }

  get editingRule() {
    const rules = this.ruleFile.content || [];
    return rules.filter(rule => rule.key === this.editRuleKey)[0] || null;
  }

  getRedirectTarget(actionList: IRuleAction[]) {
    return actionList.filter(a => a.type === 'redirect')[0]
      ? actionList.filter(a => a.type === 'redirect')[0].data.target
      : '--';
  }

  async getFile() {
    this.loading = true;
    try {
      const response = await ruleApi.getRuleContent(this.name);
      // 补齐缺失的key,兼容老版本
      _.forEach(response.data.content, rule => {
        rule.key = rule.key || uuidV4();
      });

      this.ruleFile = response.data;
    } catch (err) {
      this.$message.error(err);
    } finally {
      this.loading = false;
    }
  }

  async onDeleteRow(row: IRule, index: number) {
    try {
      await this.$confirm('此操作不可恢复, 是否继续?', '提示', {
        type: 'warning',
      });
      this.ruleFile.content.splice(index, 1);
      this.saveRule();
    } catch {
      // no operation
    }
  }

  onDuplicateRow(row: IRule, index: number) {
    const copy = _.cloneDeep(this.ruleFile.content[index]);
    copy.key = uuidV4();
    this.ruleFile.content.splice(index, 0, copy);
    this.saveRule();
  }

  /**
   * 保存
   */
  async saveRule() {
    try {
      await ruleApi.saveRule(this.name, this.ruleFile);
      this.$message.success('保存成功!');
      await this.getFile();
    } catch (err) {
      this.$message.error(err);
    }
  }

  addRule() {
    this.editRuleKey = null;
    this.dialogVisible = true;
  }

  /**
   * url: '',// 请求url
   * urlMatch: '',// url匹配规则
   * urlReg: '',// url的正则，用于路径替换
   * targetTpl: '',// 路径模板， 会用urlReg的匹配结果来替换targetTpl $1 $2
   * matchRlt:'',// url匹配结果
   * targetRlt: ''// 路径匹配结果
   * @param row
   */
  testMatchRuleRequest(row: IRule) {
    this.testMatchRuleForm.match = row.match;
    this.testMatchRuleForm.targetTpl = (row.actionList[0] && row.actionList[0].data.target) || '';
    this.testMatchRuleForm.url = '';
    this.testMatchRuleForm.matchRlt = '';
    this.testMatchRuleForm.targetRlt = '';
    this.testMatchRuleFormVisible = true;
  }

  async testMatchRule() {
    try {
      const { data } = await ruleApi.testRule(this.testMatchRuleForm);
      this.testMatchRuleForm.matchRlt = data.matchRlt;
      this.testMatchRuleForm.targetRlt = data.targetRlt;
    } catch (err) {
      this.$message.error(err);
    }
  }

  dialogEdit(key: string) {
    this.editRuleKey = key;
    this.dialogVisible = true;
  }

  hideEditDialog() {
    this.dialogVisible = false;
  }

  dialogSave(rule: IRule) {
    const rules = this.ruleFile.content || [];
    const index = _.findIndex(rules, r => r.key === rule.key);
    if (index >= 0) {
      rules[index] = rule;
    } else {
      rules.unshift(rule);
    }
    this.ruleFile.content = rules;
    this.hideEditDialog();
    this.saveRule();
  }

  openEditRuleInfoDialog() {
    this.editRuleConfigDialogVisible = true;
  }

  closeEditRuleNameDialog() {
    this.editRuleConfigDialogVisible = false;
  }

  async updateRuleInfo(newName: string, newDescription: string) {
    if (newName === '') {
      this.$message.error('规则集名称不能为空!');
      return;
    }

    try {
      await ruleApi.updateRuleInfo(this.ruleFile.name, {
        name: newName,
        description: newDescription,
      });
      this.ruleFile.name = newName;
      this.editRuleConfigDialogVisible = false;
      this.$router.replace(`/rule/edit?name=${newName}`);
      this.$message.success('修改成功!');
    } catch (err) {
      this.$message.error(err);
    }
  }

  onMoveUpRule(index: number) {
    if (index === 0) {
      return;
    }
    const rules = this.ruleFile.content || [];
    if (rules.length < 2 || index >= rules.length) {
      return;
    }
    const temp = rules[index];
    rules[index] = rules[index - 1];
    rules[index - 1] = temp;
    this.ruleFile.content = rules;
    this.saveRule();
  }

  mounted() {
    this.getFile();
  }
}
</script>

<style lang="scss" scoped>
.tip {
  font-size: 14px;
  color: #999999;
}

.rule-edit-table {
  margin-top: 20px;
}
</style>
