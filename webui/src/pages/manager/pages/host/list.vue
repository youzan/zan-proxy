<template>
  <div class="host-view">
    <div class="main-content__title">Host 文件列表</div>
    <div class="main-content__action">
      <input type="file" ref="fileField" @change="importHostFile" style="display:none;" />
      <el-button size="small" @click="importHostFileBtnClick">导入 Host 文件</el-button>
      <el-button size="small" type="primary" @click="importRemoteHostFile">导入远程 Host 文件</el-button>
      <el-button size="small" @click="createNewHostFile">新增 Host 文件</el-button>
    </div>
    <el-table border :data="hostFileList">
      <el-table-column align="center" prop="checked" label="启用" width="60">
        <template v-slot="scope">
          <el-checkbox :checked="scope.row.checked" @change="toggleHost(scope.row)" :disabled="!profile.enableHost" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名字" width="250">
        <template v-slot="scope">
          <meta-tag :isRemote="!scope.row.meta.local" remoteTooltip="远程Host" localTooltip="本地Host" />
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="250" :context="_self">
        <template v-slot="scope">
          <a class="link-btn" :href="'#/host/edit?name=' + scope.row.name">
            <el-button type="info" icon="el-icon-edit" size="mini" />
          </a>
          <a class="link-btn" :href="'/host/download?name=' + scope.row.name" target="_blank">
            <el-button type="info" icon="el-icon-share" size="mini" />
          </a>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHost(scope.row)" />
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
import MetaTag from '../../components/common/MetaTag.vue';

@Component({
  components: {
    'meta-tag': MetaTag,
  },
})
export default class HostList extends Vue {
  @profileModule.State
  profile: IProfileState[];

  @hostModule.State('list')
  hostFileList: IHostFile[];

  /**
   * 删除 host 配置
   */
  async deleteHost(row: IHostFile) {
    try {
      await this.$confirm(`此操作将永久删除该文件: ${row.name}, 是否继续?`, '提示', {
        type: 'warning',
      });
      try {
        const response = await hostApi.deleteHost(row.name);
        this.$message.success('删除成功!');
      } catch (err) {
        this.$message.error(err);
      }
    } catch {
      // no operation
    }
  }

  /**
   * 启用或禁用 host 配置
   */
  async toggleHost(hostFile: IHostFile) {
    try {
      const response = await hostApi.toggleHost(hostFile.name, !hostFile.checked);
      this.$message.success('设置成功!');
    } catch (err) {
      this.$message.error(err);
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
    (this.$refs.fileField as HTMLInputElement).click();
  }

  /**
   * 导入 host 文件
   */
  importHostFile(evt: MouseEvent) {
    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent) => {
      const fileStr = (e.target as FileReader).result as string;
      const hostFile = JSON.parse(fileStr);
      hostFile.checked = false;
      try {
        await hostApi.createHost(hostFile);
        this.$message.success('导入成功');
      } catch (err) {
        this.$message.error(err);
      } finally {
        // clear file field
        (this.$refs.fileField as HTMLInputElement).value = '';
      }
    };
    const files = (evt.target as HTMLInputElement).files;
    if (!files || !files[0]) {
      return;
    }
    const file = files[0];
    reader.readAsText(file);
  }

  /**
   * 导入远程文件
   */
  async importRemoteHostFile() {
    const result = (await this.$prompt('请输入远程Host文件的url', '导入远程Host文件')) as MessageBoxInputData;

    let url = result.value;
    try {
      await hostApi.importRemoteHost(url);
      this.$message.success('导入成功');
    } catch (err) {
      this.$message.error(err);
    }
    return;
  }
}
</script>
<style lang="scss" scoped>
.host-view {
  .addhost-btn-wrap {
    text-align: right;
  }
}
</style>
