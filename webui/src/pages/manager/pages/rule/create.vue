<template>
  <div>
    <div class="main-content__title">创建规则集</div>
    <el-form :model="createRuleForm" :rules="rules" ref="ruleForm" label-width="100px" class="rule-form">
      <el-form-item label="规则集名字" prop="name">
        <el-input v-model="createRuleForm.name"></el-input>
      </el-form-item>
      <el-form-item label="规则集描述" prop="description">
        <el-input type="textarea" v-model="createRuleForm.description"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">立即创建</el-button>
        <el-button @click="back">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import * as ruleApi from '../../api/rule';
import Vue from 'vue';
import { ElForm } from 'element-ui/types/form';
import { Message } from 'element-ui';
import { Component, Watch } from 'vue-property-decorator';
import { IRuleFile } from '@core/types/rule';
import { MessageBoxInputData, MessageBoxCloseAction } from 'element-ui/types/message-box';
import { ruleModule, profileModule } from '../../store';
import { IProfileState } from '../../store/profile';

@Component
export default class RuleCreate extends Vue {
  createRuleForm = {
    name: '',
    checked: true,
    description: '',
  };

  rules = {
    name: [
      { required: true, message: '请输入文件名称名称', trigger: 'blur' },
      {
        min: 2,
        max: 50,
        message: '长度在 2 到 20 个字符',
        trigger: 'blur',
      },
    ],
    description: [{ required: true, message: '请填文件描述', trigger: 'blur' }],
  };

  async submitForm() {
    try {
      await (this.$refs.ruleForm as ElForm).validate();
      try {
        await ruleApi.createRule(this.createRuleForm.name, this.createRuleForm.description);
        // 判断创建成功还是失败
        this.$message.success('创建成功');
        this.$router.push(`/rule/edit?name=${this.createRuleForm.name}`);
      } catch (err) {
        this.$message.error(err);
      }
    } catch {
      // no operation
    }
  }

  back() {
    this.$router.push('/rule/list');
  }
}
</script>

<style lang="scss" scoped>
.rule-form {
  margin: 20px;
  width: 60%;
  min-width: 600px;
}
</style>
