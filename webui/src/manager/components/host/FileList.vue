<template>
  <div class="host-view">
    <div class="main-content__title">Host 文件列表</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col class="addhost-btn-wrap">
        <input type="file" ref="fileimport" @change="importHostFile" style="display:none;" />
        <el-button size="small" @click='importHostFileBtnClick'>导入 Host 文件</el-button>
        <el-button size="small" type="primary" @click='importRemoteHostFile'>导入远程 Host 文件</el-button>
        <el-button size="small" @click='addNewHostFile'>新增 Host 文件</el-button>
      </el-col>
    </el-row>
    <el-table border align='center' :data="$dc.hostFileList">
      <el-table-column prop="checked" label="启用" width="85">
        <template scope='scope'>
          <el-checkbox :checked="scope.row.checked" @change="toggleFile(scope.row.name)" :disabled="!$dc.hostState" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名字" width="150">
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" :width="136" :context="_self">
        <template scope='scope'>
          <a :href="'#/edithost?name='+scope.row.name">
            <el-button type="info" icon='edit' size="mini">
            </el-button>
          </a>
          <a :href="'/host/download?name='+scope.row.name" target="_blank">
            <el-button type="info" icon='share' size="mini">
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
    </el-table>
  </div>
</template>
<script>
  import hostApi from '../../../api/host'
  import _ from 'lodash'



  export default {
    name: 'hostlist',
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
      toggleFile(name) {
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
      },
      importHostFileBtnClick() {
        this.$refs.fileimport.click();
      },
      importHostFile(evt) {
        const reader = new FileReader();
        reader.onload = e => {
          const fileStr = e.target.result;
          const hostFile = JSON.parse(fileStr);
          hostFile.checked = false;
          hostApi.saveFile(hostFile.name, hostFile);
        };
        const files = evt.target.files;
        const file = files[0];
        if (!file) return;
        reader.readAsText(file);
      },
      // 导入远程文件
      async importRemoteHostFile() {
        let result = await this.$prompt(
          '请输入远程Host文件的url',
          '导入远程Host文件',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          }
        );

        let url = result.value;
        try{
          const response = await hostApi.importRemote(url)
          const res = response.data
          if (res.code !== 0) {
            throw res.msg
          }
          this.$message({
            message: '导入成功',
            type: 'success'
          })
        } catch (e) {
          this.$message.error(`出错了, ${e}`)
        }
        return
      },
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
