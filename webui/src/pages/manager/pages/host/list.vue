<template>
  <div class="host-view">
    <div class="main-content__title">Host 文件列表</div>
    <div class="action-wrapper">
      <input type="file" ref="fileimport" @change="importHostFile" style="display:none;" />
      <el-button size="small" @click="importHostFileBtnClick">导入 Host 文件</el-button>
      <el-button size="small" type="primary" @click="importRemoteHostFile">导入远程 Host 文件</el-button>
      <el-button size="small" @click="createNewHostFile">新增 Host 文件</el-button>
    </div>
    <el-table border :data="hostFileList">
      <el-table-column align="center" prop="checked" label="启用" width="60">
        <template v-slot="scope">
          <el-checkbox
            :checked="scope.row.checked"
            @change="toggleFile(scope.row.name)"
            :disabled="!profile.enableHost"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名字" width="250"></el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="250" :context="_self">
        <template v-slot="scope">
          <a class="link-btn" :href="'#/host/edit?name=' + scope.row.name">
            <el-button type="info" icon="el-icon-edit" size="mini"></el-button>
          </a>
          <a class="link-btn" :href="'/host/download?name=' + scope.row.name" target="_blank">
            <el-button type="info" icon="el-icon-share" size="mini"></el-button>
          </a>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteFile(scope.row, scope.$index, user_list)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import 'vue-router';
import { ElForm } from 'element-ui/types/form';
import { Message } from 'element-ui';
import { Component, Watch } from 'vue-property-decorator';
import map from 'lodash/map';
import { IHostFile } from '@core/types/host';
import forEach from 'lodash/forEach';
import * as hostApi from '../../api/host';
import { MessageBoxInputData } from 'element-ui/types/message-box';
import { hostModule, profileModule } from '../../store';
import { IProfileState } from '../../store/profile';

@Component
export default class HostList extends Vue {
  @profileModule.State
  profile: IProfileState[];

  @hostModule.State('list')
  hostFileList: IHostFile[];

  /**
   * 删除 host 配置
   */
  async deleteFile(row: IHostFile) {
    try {
      await this.$confirm(`此操作将永久删除该文件: ${row.name}, 是否继续?`, '提示', {
        type: 'warning',
      });
      try {
        const response = await hostApi.deleteFile(row.name);
        this.$message.success('删除成功!');
      } catch (err) {
        this.$message.error(`出错了，${err}`);
      }
    } catch {
      // no operation
    }
  }

  /**
   * 启用或禁用 host 配置
   */
  async toggleFile(name: string) {
    try {
      const response = await hostApi.toggleFile(name);
      this.$message.success('设置成功!');
    } catch (err) {
      this.$message.error(`出错了,请刷新页面，${err}`);
    }
  }

  /**
   * 创建新的 host 配置
   */
  createNewHostFile() {
    this.$router.push('/host/edit');
  }

  /**
   * 打开导入弹框
   */
  importHostFileBtnClick() {
    (this.$refs.fileimport as HTMLInputElement).click();
  }

  /**
   * 导入 host 文件
   */
  importHostFile(evt: MouseEvent) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent) => {
      const fileStr = (e.target as FileReader).result as string;
      const hostFile = JSON.parse(fileStr);
      hostFile.checked = false;
      hostApi.saveFile(hostFile.name, hostFile);
    };
    const files = (evt.target as HTMLInputElement).files;
    if (!files) {
      return;
    }
    const file = files[0];
    if (!file) {
      return;
    }
    reader.readAsText(file);
  }

  /**
   * 导入远程文件
   */
  async importRemoteHostFile() {
    const result = (await this.$prompt('请输入远程Host文件的url', '导入远程Host文件')) as MessageBoxInputData;

    let url = result.value;
    try {
      await hostApi.importRemote(url);
      this.$message.success('导入成功');
    } catch (err) {
      this.$message.error(`出错了, ${err}`);
    }
    return;
  }
}
</script>
<style lang="scss" scoped>
.action-wrapper {
  text-align: right;
  margin-bottom: 10px;
}

.host-view {
  .addhost-btn-wrap {
    text-align: right;
  }
}
</style>
