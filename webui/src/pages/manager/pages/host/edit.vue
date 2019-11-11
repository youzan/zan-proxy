<template>
  <div>
    <div class="main-content__title">
      {{ isCreate ? '创建' : '编辑' }}Host文件
      <el-button-group v-if="!isRemote" class="main-content__action">
        <el-button size="small" @click="addRow">新增Host Entry</el-button>
        <el-button size="small" type="primary" @click="save">保存</el-button>
      </el-button-group>
    </div>
    <p class="tip" v-if="isRemote">该Host文件为远程Host文件，如需修改，请复制对应Host。</p>
    <el-form :model="hostForm" :rules="rules" ref="ruleForm" label-width="100px" class="host-form">
      <el-form-item label="文件名称" prop="name">
        <el-input :disabled="!isCreate || isRemote" v-model="hostForm.name"></el-input>
      </el-form-item>
      <el-form-item label="文件描述" prop="description">
        <el-input :disabled="isRemote" type="textarea" v-model="hostForm.description"></el-input>
      </el-form-item>
      <el-form-item label="解析内容">
        <el-table border :data="contentRows">
          <el-table-column type="index" align="center" :width="60"></el-table-column>
          <el-table-column prop="key" label="域名" align="center">
            <template v-slot="scope">
              <el-input :disabled="isRemote" v-model.trim="scope.row.key" size="small" placeholder="请输入内容" />
            </template>
          </el-table-column>
          <el-table-column prop="value" label="ip地址" align="center" :width="400">
            <template v-slot="scope">
              <el-input :disabled="isRemote" v-model.trim="scope.row.value" size="small" placeholder="请输入内容" />
            </template>
          </el-table-column>
          <el-table-column label="操作" :width="80" align="center" :context="_self">
            <template v-slot="scope">
              <el-button
                :disabled="isRemote"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteRow(scope.row, scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import 'vue-router';
import * as hostApi from '../../api/host';
import { ElForm } from 'element-ui/types/form';
import { Message } from 'element-ui';
import { Component, Watch } from 'vue-property-decorator';
import map from 'lodash/map';
import { IHostFile } from '@core/types/host';
import forEach from 'lodash/forEach';

interface IRow {
  key: string;
  value: string;
}

@Component
export default class HostEdit extends Vue {
  loading = false;

  hostForm: IHostFile = {
    meta: {
      local: true,
    },
    checked: false,
    name: '',
    description: '',
    content: {},
  };
  contentRows: IRow[] = [];

  rules = {
    name: [
      { required: true, message: '请输入文件名称名称', trigger: 'blur' },
      {
        min: 2,
        max: 50,
        message: '长度在 2 到 50 个字符',
        trigger: 'blur',
      },
    ],
    description: [{ required: true, message: '请填文件描述', trigger: 'blur' }],
  };

  get isCreate() {
    const name = this.$route.query.name;
    return !name;
  }

  /**
   * 是否是远程规则
   */
  get isRemote() {
    const { loading, hostForm } = this;
    return !loading && hostForm.meta && !hostForm.meta.local;
  }

  refreshContentRows() {
    // 解析host数组
    this.contentRows = map(this.hostForm.content, (value, key) => ({
      key,
      value,
    }));
  }

  /**
   * 获取 host 配置信息
   */
  async fetchHost() {
    this.loading = true;
    try {
      const name = this.$route.query.name as string;
      const response = await hostApi.getHost(name);
      this.hostForm = response.data;
      // 解析host数组
      this.refreshContentRows();
    } catch (err) {
      this.$message.error(err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * 添加一条 host 解析规则
   */
  addRow() {
    this.contentRows.push({
      key: '',
      value: '',
    });
  }

  /**
   * 删除一条 host 解析规则
   */
  async deleteRow(row: IRow, index: number) {
    this.contentRows.splice(index, 1);
  }

  /**
   * 创建 host
   */
  async save() {
    const form = this.$refs.ruleForm as ElForm;
    try {
      await form.validate();

      const content: IHostFile['content'] = {};
      forEach(this.contentRows, obj => {
        if (obj.key) {
          content[obj.key] = obj.value;
        }
      });
      this.hostForm.content = content;

      try {
        const response = await (this.isCreate
          ? hostApi.createHost(this.hostForm as hostApi.ICreateHostData)
          : hostApi.saveHost(this.$route.query.name as string, this.hostForm));
        this.refreshContentRows();
        // 判断创建成功还是失败
        this.$message.success('保存成功!');
        this.$router.push('/host/list');
      } catch (err) {
        this.$message.error(err);
      }
    } catch {
      return false;
    }
  }

  mounted() {
    if (this.$route.query.name) {
      this.fetchHost();
    }
  }
}
</script>

<style lang="scss" scoped>
.tip {
  font-size: 14px;
  color: #999999;
}

.host-form {
  margin: 20px;
  min-width: 600px;
}
</style>
