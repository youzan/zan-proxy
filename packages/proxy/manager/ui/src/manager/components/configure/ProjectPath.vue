<template>
  <div>
    <div class="main-content__title">工程路径管理</div>
    <!-- <el-form label-width="100px">
      <template v-for="(obj ,index) in $dc.projectPathArray">
        <el-form-item label="工程名">
          <el-input v-model="obj.key" placeholder="工程名" />
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="obj.value" placeholder="工程在本地的绝对路径" />
        </el-form-item>
        <el-row :gutter="10" style="margin-top: 5px;">
          <el-col :span="2">
            <el-button
              type="danger"
              icon='delete'
              size="mini"
              @click='deleteParam(obj,index,projectPathArray)'
            />
          </el-col>
        </el-row>
      </template>
      
      <el-form-item>
        <el-button @click="addParam">增加工程路径设置</el-button>
        <el-button type="primary" @click="saveFile">保存</el-button>
      </el-form-item>
    </el-form> -->
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="6" :offset="18" style="text-align:right">
        <el-button size="small" @click='saveFile' type="primary">保存工程路径设置</el-button>
        <el-button size="small" @click='addParam'>增加工程路径设置</el-button>
      </el-col>
    </el-row>
    <el-table border align='center' :data="$dc.projectPathArray">
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="key" label="工程名" width="200">
        <template scope='scope'>
          <el-input v-model="scope.row.key" size="small" placeholder="请输入工程名"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="value" label="工程路径">
        <template scope='scope'>
          <el-input v-model="scope.row.value" size="small" placeholder="请输入工程路径"></el-input>
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
