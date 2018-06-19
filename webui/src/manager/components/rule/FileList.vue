<template>
  <div>
    <div class="main-content__title">规则集列表</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col class="addrule-btn-wrap">
        <input type="file" @change="fileUpload" class="importfile"/>
        <el-button size="small">导入规则集</el-button>
        <el-button size="small" type="primary" @click='importRemoteRule'>导入远程规则</el-button>
        <el-button size="small" type="primary" @click='addRuleCollection'>新增规则集</el-button>
      </el-col>
    </el-row>
    <el-table border :data="$dc.ruleFileList">
      <el-table-column prop="checked" label="启用" width="100">
        <template scope='scope'>
          <el-checkbox
            v-model="scope.row.checked"
            :disabled="!$dc.ruleState"
            @change="onSelectionChange(scope.row.name,scope.row.checked)"
          />
        </template>
      </el-table-column>
      <!-- <el-table-column prop="disableSync" label="禁用同步" width="100">
        <template scope='scope'>
          <el-checkbox
            v-model="scope.row.disableSync"
            :disabled="!$dc.ruleState"
            @change="onDisableSyncChange(scope.row.name,scope.row.disableSync)"
            v-if="scope.row.meta.remote"
          />
          <span v-else>/</span>
        </template> 
      </el-table-column>-->
      <el-table-column prop="name" label="名字" width="200">
        <template scope="scope">
          <el-tooltip class="item" effect="dark" content="远程规则" placement="right" v-if="scope.row.meta.remote">
            <span class="file-tag remote">R</span>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="本地规则" placement="right" v-else >
            <span class="file-tag">L</span>
          </el-tooltip>
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" :width="180" :context="_self">
        <template scope="scope">
          <a :href="'#/editrule?name='+scope.row.name">
            <el-tooltip class="item" effect="dark" content="编辑规则" placement="top-start">
              <el-button type="info" icon='edit' size="mini">
              </el-button>
            </el-tooltip>
          </a>
          <span>
            <el-tooltip class="item" effect="dark" content="导出规则" placement="top-start">
              <el-button  type="info" icon='share' size="mini" @click='onShareFile(scope.row,scope.$index)' />
            </el-tooltip>
          </span>
          <el-tooltip class="item" effect="dark" content="复制规则" placement="top-start">
            <el-button  type="info" icon='document' size="mini" @click='onCopyFile(scope.row,scope.$index)' />
          </el-tooltip>
          <span>
            <el-button type="danger" icon='delete' size="mini" @click='onDeleteFile(scope.row,scope.$index)' />
          </span>
          <!-- <span>
            <el-tooltip class="item" effect="dark" content="同步远程文件" placement="top-start">
              <el-button
                type="success"
                icon="information"
                size="mini"
                v-if="scope.row.meta.remote && scope.row.meta.remoteETag && (scope.row.meta.ETag !== scope.row.meta.remoteETag)"
                @click="onUpdateFile(scope.row,scope.$index)"
              />
            </el-tooltip>
          </span> -->
        </template>
      </el-table-column>
      <!-- <el-table-column prop="checked" label="启用" width="100">
        <template scope='scope'>
          <el-switch
            v-model="scope.row.checked"
            :disabled="!$dc.ruleState"
            @change="onSelectionChange(scope.row.name,scope.row.checked)"
          />
        </template>
      </el-table-column> -->
    </el-table>
  </div>
</template>
<script>
import ruleApi from '../../../api/rule';
import utilsApi from '../../../api/utils';
import _ from 'lodash';
export default {
  name: 'rulefilelist',
  methods: {
    onDeleteFile(row, index) {
      this.$confirm(`此操作将永久删除该文件: ${row.name}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ruleApi.deleteFile(row.name).then(response => {
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
      });
    },
    onShareFile(row, index) {
      if (!row.meta.remote) {
        window.location = '/rule/download?name=' + row.name;
      } else {
        this.$alert(row.meta.url, '规则URL', {
          confirmButtonText: 'OK',
          callback: action => {}
        });
      }
    },
    onCopyFile(row, index) {
      ruleApi.copyFile(row.name).then(() => {
        this.$message({
          type: 'success',
          message: '复制成功!'
        })
      });
    },
    onUpdateFile(row, index) {
      this.$confirm(`确定更新: ${row.name} 么?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ruleApi.getRemoteRuleFile(row.meta.url).then(response => {
          var remoteFileResponse = response.data;
          var content = remoteFileResponse.data;
          content.meta = {
            remote: true,
            url: row.meta.url,
            ETag: remoteFileResponse.headers['etag'],
            remoteETag: remoteFileResponse.headers['etag']
          };
          content.name = content.name + '-remote';
          ruleApi.saveFile(content.name, content).then(response => {
            var serverData = response.data;
            if (serverData.code == 0) {
              // 判断创建成功还是失败
              this.$message({
                message: '恭喜你，更新成功',
                type: 'success'
              });
            } else {
              _this.$message.error(`出错了，${serverData.msg}`);
            }
          });
        });
      });
    },
    // 导入远程文件
    async importRemoteRule() {
      let result = await this.$prompt(
        '请输入远程规则文件的url',
        '导入远程规则',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      );

      let url = result.value;
      try{
        const response = await ruleApi.importRemote(url)
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
    onSelectionChange(name, checked) {
      ruleApi.setFileCheckStatus(name, checked).then(response => {
        var serverData = response.data;
        if (serverData.code == 0) {
          this.$message({
            type: 'success',
            message: '设置成功!'
          });
        } else {
          this.$message.error(`出错了，${serverData.msg}`);
        }
      });
    },
    onDisableSyncChange(name, checked) {
      ruleApi.setFileDisableSync(name, checked).then(response => {
        var serverData = response.data;
        if (serverData.code == 0) {
          this.$message({
            type: 'success',
            message: '设置成功!'
          });
        } else {
          this.$message.error(`出错了，${serverData.msg}`);
        }
      });
    },
    addRuleCollection() {
      this.$router.push('createrulefile');
    },
    fileUpload(evt) {
      var _this = this;
      var files = evt.target.files;
      var file = files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function(e) {
        var contentStr = e.target.result;
        var content = JSON.parse(contentStr);

        // 判断是否存在同名规则，如果存在不允许导入
        var finded = _.find(_this.fileList, file => {
          return file.name == content.name;
        });
        if (finded) {
          _this.$message.error(
            `已经存在名为${
              content.name
            }的规则，请修改规则文件里的name字段,以及文件名`
          );
          return;
        }
        // 查找引用的变量
        var varNameList = ruleApi.getReferenceVar(content);
        var infoStr;
        if (varNameList.length > 0) {
          infoStr = `导入规则文件名为${
            content.name
          },引用变量【${varNameList.join(
            '; '
          )}】请确保变量已经在工程路径配置中设置过值`;
        } else {
          infoStr = `导入规则文件名为${content.name}`;
        }
        _this.$alert(infoStr, '规则文件导入', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              // 创建文件
              ruleApi.saveFile(content.name, content).then(response => {
                var serverData = response.data;
                if (serverData.code == 0) {
                  // 判断创建成功还是失败
                  _this.$message({
                    message: '恭喜你，导入成功',
                    type: 'success'
                  });
                } else {
                  _this.$message.error(`出错了，${serverData.msg}`);
                }
              });
            }
          }
        });
      };
      reader.readAsText(file);
    }
  }
};
</script>
<style>
.addrule-btn-wrap {
  text-align: right;
  float: right;
}

.importfile {
  position: absolute;
  width: 80px;
  height: 28px;
  opacity: 0;
  cursor: pointer;
}

.importfile::-webkit-file-upload-button {
  cursor: pointer;
}

.file-tag {
  background-color: rgb(191, 203, 217);
  color: #fff;
  font-size: 10px;
  display: inline-block;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  line-height: 16px;
  margin-left: 2px;
  text-align: center;
  opacity: 0.5;
}

.file-tag.remote {
  background-color: #58b7ff;
}

</style>
