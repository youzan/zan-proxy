<template>
  <div>
    <div class="main-content__title">转发变量管理</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="6" :offset="18" style="text-align:right">
        <el-button size="small" @click='saveFile' type="primary">保存转发变量设置</el-button>
        <el-button size="small" @click='addParam'>增加转发变量设置</el-button>
      </el-col>
    </el-row>
    <el-table border align='center' :data="$dc.projectPathArray">
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="key" label="变量名" width="200">
        <template scope='scope'>
          <el-input v-model="scope.row.key" size="small" placeholder="请输入变量名"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="value" label="变量值">
        <template scope='scope'>
          <el-input v-model="scope.row.value" size="small" placeholder="请输入变量值"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="136" :context="_self">
        <template scope='scope'>
          <el-button
            type="danger"
            icon='delete'
            size="mini"
            @click="deleteParam(scope.row,scope.$index,projectPathArray)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import profileApi from '../../../api/profile';
import forEach from 'lodash/forEach';

export default {
  name: 'project-path',

  methods: {
    deleteParam(row, index, list) {
      this.$confirm('此操作不可恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$dc.projectPathArray.splice(index, 1);
      });
    },

    async saveFile() {
      var projectPathMap = {};
      forEach(this.$dc.projectPathArray, obj => {
        projectPathMap[obj.key] = obj.value;
      });
      const projectNames = Object.keys(projectPathMap)
      for(const k of projectNames) {
        if (k.includes('-')) {
          this.$message.error(`变量名${k}包含非法字符"-"`);
          return
        }
      }
      this.$dc.profile.projectPath = projectPathMap;
      let response = await profileApi.saveFile(this.$dc.profile);
      let serverData = response.data;
      if (serverData.code == 0) {
        this.$message({
          type: 'success',
          message: '保存成功!'
        });
      } else {
        this.$message.error(`出错了，${serverData.msg}`);
      }
    },

    addParam() {
      this.$dc.projectPathArray.push({
        key: '',
        value: ''
      });
    }
  }
};
</script>
