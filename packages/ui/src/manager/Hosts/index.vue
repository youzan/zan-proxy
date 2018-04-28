<template>
  <div class="hosts">
    <div class="main-content__title">Host 文件列表</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="6" :offset="18" class="addhost-btn-wrap">
        <el-button size="small" @click='addNewHostFile'>新增 Host 文件</el-button>
      </el-col>
    </el-row>
    <el-table border align='center'>
      <el-table-column prop="name" label="名字" width="150">
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" :width="136" :context="_self">
        <template slot-scope='scope'>
          <a :href="'#/edithost?name='+scope.row.name">
            <el-button type="info" icon='edit' size="mini">
            </el-button>
          </a>
          <el-button type="danger" icon='delete' size="mini" @click="onDeleteFile(scope.row,scope.$index,user_list)" />
        </template>
      </el-table-column>
      <el-table-column prop="checked" label="启用" width="85">
        <template slop-scope='scope'>
          <!-- <el-radio v-model="selectedFileName" :label="scope.row.name" :disabled="!$dc.hostState" /> -->
          <!-- <el-radio v-model="selectedFileName" :label="scope.row.name" /> -->
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import gql from 'graphql-tag';

const hostsList = gql`
  query {
    hostsList {
      name
      checked
      description
      content {
        hostname
        address
      }
    }
  }
`;

export default {
  name: 'hosts',
  apollo: {
    hostsList
  },
  data() {
    return {
      hostsList: [] 
    }
  },
  methods: {
    addNewHostFile() {
      
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

