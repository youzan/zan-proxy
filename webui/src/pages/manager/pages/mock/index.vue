<template>
  <div>
    <div class="main-content__title">Mock 数据文件列表</div>
    <div class="main-content__action">
      <el-button size="small" @click="createMockData">新增数据文件</el-button>
    </div>
    <el-table border :data="dataList">
      <el-table-column prop="name" label="名字" align="center" :width="400" :sortable="true"></el-table-column>
      <el-table-column prop="contentType" label="类型" :width="400" align="center"></el-table-column>
      <el-table-column label="操作" align="center" :context="_self">
        <template v-slot="scope">
          <el-button type="info" icon="el-icon-edit" size="mini" @click="editMockData(scope.row)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteMockData(scope.row, scope.$index)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增自定义mock数据文件对话框 -->
    <el-dialog
      title="编辑 Mock 数据"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="40px"
    >
      <el-form ref="mockDataForm" :model="mockDataForm" :rules="validateRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="mockDataForm.name"></el-input>
        </el-form-item>
        <el-form-item label="格式" prop="contentType">
          <el-select v-model="language" placeholder="请选择数据格式">
            <el-option v-for="item in mockLanguageTypes" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :show-message="false" label-width="0" class="content-editor-container" prop="content">
          <div id="content-editor" class="content-editor"></div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveMockData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import forEach from 'lodash/forEach';
import findKey from 'lodash/findKey';
import uuidV4 from 'uuid/v4';
import { IMockRecord } from '@core/types/mock';
import { mockModule } from '../../store';
import * as dataApi from '../../api/data';
import * as Monaco from 'monaco-editor';
import noop from 'lodash/noop';
import { ElForm } from 'element-ui/types/form';

let editor: Monaco.editor.IStandaloneCodeEditor;

interface IMockDataForm {
  isNew: boolean;
  id: string;
  name: string;
  contentType: string;
  content: string;
}

enum languageContentTypeMap {
  text = 'text/plain',
  html = 'text/html',
  json = 'application/json',
  javascript = 'application/javascript',
}

type IAvaliableLanguage = keyof typeof languageContentTypeMap;

@Component
export default class Mock extends Vue {
  @mockModule.State('list')
  dataList: IMockRecord[];

  dialogVisible = false;

  mockLanguageTypes: IAvaliableLanguage[] = ['text', 'html', 'json', 'javascript'];

  mockDataForm: IMockDataForm = {
    isNew: true,
    id: '',
    name: '',
    contentType: '',
    content: '',
  };

  validateRules = {
    name: [
      {
        required: true,
        message: '请输入名称',
        trigger: 'blur',
      },
    ],
    contentType: [
      {
        required: true,
        message: '请选择数据格式',
        trigger: 'change',
      },
    ],
    content: [
      {
        validator: (rule: any, value: any, callback: (error?: Error) => void) => {
          const model = editor.getModel();
          if (!model) {
            return;
          }
          const markers = Monaco.editor.getModelMarkers({});
          markers.length ? callback(new Error(markers[0].message)) : callback();
        },
      },
    ],
  };

  get language() {
    const language = findKey(languageContentTypeMap, v => v === this.mockDataForm.contentType) || 'text';
    return language as IAvaliableLanguage;
  }

  set language(language: keyof typeof languageContentTypeMap) {
    this.mockDataForm.contentType = languageContentTypeMap[language];
    const model = editor.getModel();
    if (!model) {
      return;
    }
    Monaco.editor.setModelLanguage(model, language);
  }

  /**
   * 删除mock数据
   */
  async deleteMockData(entry: IMockRecord, index: number) {
    try {
      await this.$confirm(`此操作将永久删除该数据文件: ${entry.name}, 是否继续?`, '提示', {
        type: 'warning',
      });
      this.dataList.splice(index, 1);
      try {
        await dataApi.saveDataList(this.dataList);
        this.$message.success('删除成功!');
      } catch (err) {
        this.$message.error(err);
      }
    } catch {
      // no operation
    }
  }

  /**
   * 创建新 mock 数据
   */
  createMockData() {
    this.showDialog(
      {
        id: uuidV4(),
        name: 'mock 数据',
        contentType: languageContentTypeMap.json,
      },
      true,
    );
  }

  /**
   * 修改 mock 数据
   */
  editMockData(record: IMockRecord) {
    this.showDialog(record, false);
  }

  /**
   * 打开 mock 数据编辑弹框
   */
  async showDialog(record: IMockRecord, isNew: boolean) {
    this.mockDataForm.isNew = isNew;
    this.mockDataForm.id = record.id;
    this.mockDataForm.name = record.name;
    this.mockDataForm.contentType = record.contentType;
    this.mockDataForm.content = '';
    if (!isNew) {
      try {
        const response = await dataApi.getDataFile(this.mockDataForm.id);
        this.mockDataForm.content = response.data.content;
      } catch (error) {
        this.$message.error(`获取 mock 数据失败，${error}`);
      }
    }
    this.dialogVisible = true;

    if (!editor) {
      this.$nextTick().then(() => {
        const editorEl = document.getElementById('content-editor') as HTMLElement;
        editor = Monaco.editor.create(editorEl, {
          value: this.mockDataForm.content,
          language: this.mockDataForm.contentType,
          theme: 'vs-dark',
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false,
          },
        });
      });
    } else {
      editor.setValue(this.mockDataForm.content);
      const model = editor.getModel();
      if (!model) {
        return;
      }
      Monaco.editor.setModelLanguage(model, this.language);
      this.$nextTick(() => {
        editor.render();
        editor.focus();
      });
    }
  }

  /**
   * 保存 mock 数据
   */
  async saveMockData() {
    const mockDataFormRef = this.$refs['mockDataForm'] as ElForm;

    try {
      await mockDataFormRef.validate();
    } catch {
      return;
    }

    if (this.mockDataForm.isNew) {
      // 创建新记录
      this.dataList.push({
        id: this.mockDataForm.id,
        name: this.mockDataForm.name,
        contentType: this.mockDataForm.contentType,
      });
    } else {
      // 修改旧记录
      const record = this.dataList.find(record => record.id === this.mockDataForm.id);
      if (record) {
        record.name = this.mockDataForm.name;
        record.contentType = this.mockDataForm.contentType;
      }
    }

    try {
      await Promise.all([
        dataApi.saveDataList(this.dataList),
        dataApi.saveDataFile(this.mockDataForm.id, editor.getValue()),
      ]);
      mockDataFormRef.resetFields();
      this.dialogVisible = false;
      this.$message.success('保存成功!');
    } catch (err) {
      this.$message.error(err);
    }
  }
}
</script>

<style lang="scss" scoped>
.content-editor {
  height: 360px;

  &-container {
    margin-bottom: 0;
  }
}
</style>
