<template>
  <div>
    <div class="main-content__title">转发变量管理</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="6" :offset="18" style="text-align:right">
        <el-button size="small" @click="save" type="primary">保存转发变量</el-button>
        <el-button size="small" @click="addParam">增加转发变量</el-button>
      </el-col>
    </el-row>
    <el-table border :data="projectPathArray">
      <el-table-column type="index" align="center" width="60"></el-table-column>
      <el-table-column prop="key" align="center" label="变量名" width="200">
        <template v-slot="scope">
          <el-input v-model="scope.row.key" size="small" placeholder="请输入变量名"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="value" align="center" label="变量值">
        <template v-slot="scope">
          <el-input v-model="scope.row.value" size="small" placeholder="请输入变量值"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="150" align="center" :context="_self">
        <template v-slot="scope">
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParam(scope.row, scope.$index)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import forEach from 'lodash/forEach';
import { Message } from 'element-ui';
import { IProfile } from '@core/types/profile';
import { profileModule } from '../../store';

import * as profileApi from '../../api/profile';
import { IProjectPath } from '../../store/profile';

@Component
export default class Profile extends Vue {
  @profileModule.State('profile')
  profile: IProfile;

  @profileModule.State('projectPathArray')
  projectPathArray: IProjectPath[];

  deleteParam(row: IProjectPath, index: number) {
    this.$confirm('是否删除该变量?', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      this.projectPathArray.splice(index, 1);
      this.save();
    });
  }

  async save() {
    const projectPathMap: Record<string, string> = {};
    forEach(this.projectPathArray, obj => {
      if (obj.key) {
        projectPathMap[obj.key] = obj.value;
      }
    });
    const projectNames = Object.keys(projectPathMap);
    for (const k of projectNames) {
      if (k.includes('-')) {
        this.$message.error(`变量名${k}包含非法字符"-"`);
        return;
      }
    }
    try {
      const response = await profileApi.saveProjectPath(projectPathMap);
      this.profile.projectPath = projectPathMap;
      this.$message.success('保存成功!');
    } catch (err) {
      this.$message.error(`出错了，${err}}`);
    }
  }

  /**
   * 添加变量
   */
  addParam() {
    this.projectPathArray.push({
      key: '',
      value: '',
    });
  }
}
</script>
