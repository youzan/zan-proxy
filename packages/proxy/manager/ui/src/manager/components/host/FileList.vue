<template>
  <div class="host-view">
    <div class="main-content__title">Host 文件列表</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="6" :offset="18" class="addhost-btn-wrap">
        <el-button size="small" @click='addNewHostFile'>新增 Host 文件</el-button>
      </el-col>
    </el-row>
    <el-table border align='center' :data="$dc.hostFileList">
      <el-table-column prop="name" label="名字" width="150">
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" :width="136" :context="_self">
        <template scope='scope'>
          <a :href="'#/edithost?name='+scope.row.name">
            <el-button type="info" icon='edit' size="mini">
            </el-button>
          </a>
          <el-button
            type="danger"
            icon='delete'
            size="mini"
            @click="onDeleteFile(scope.row,scope.$index,user_list)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="checked" label="启用" width="85">
        <template scope='scope'>
          <!-- <el-radio v-model="selectedFileName" :label="scope.row.name" :disabled="!$dc.hostState" /> -->
          <el-radio v-model="selectedFileName" :label="scope.row.name" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
  import hostApi from '../../../api/host'
  import _ from 'lodash'



  export default {
    name: 'hostlist',

    computed: {
      selectedFileName: {
        get(){
          // 遍历找出选择的文件
          var selectedFile = _.find(this.$dc.hostFileList, (file) => {
            return file.checked;
          });
          return selectedFile ? selectedFile.name : '';
        },
        set(value){
          this.$dc.hostFileList.forEach(function (row) {
              if (row.name != value) {
                  row.checked = false;
              } else {
                  row.checked = true;
              }
          });
          this.useFile(value);
        }
      }
    },
    methods: {
      onDeleteFile(row, index, list) {
        this.$confirm(`此操作将永久删除该文件: ${row.name}, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          hostApi.deleteFile(row.name).then((response) => {
            var serverData = response.data;
            if (serverData.code == 0) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            } else {
              this.$message.error(`出错了，${serverData.msg}`);
            }
          });
        })
      },
      useFile(name) {
          hostApi.debouncedUseFile(name, (response) => {
          var serverData = response.data;
          if (serverData.code == 0) {
            this.$message({
              type: 'success',
              message: '设置成功!'
            });
          } else {
            this.$message.error(`出错了,请刷新页面，${serverData.msg}`);
          }
        });
      },
      addNewHostFile(){
        this.$router.push('createhostfile');
      }
    }
  }

</script>
<style lang="postcss">
.host-view {
  .addhost-btn-wrap {
   text-align: right;
  }

  .el-radio__label {
    display: none;
  }
}
</style>
