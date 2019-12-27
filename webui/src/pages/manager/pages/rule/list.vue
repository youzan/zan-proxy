<template>
  <div>
    <div class="main-content__title">规则集列表</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col class="addrule-btn-wrap">
        <input type="file" @change="importLocalRuleFile" class="import-file" />
        <el-button size="small">导入规则集</el-button>
        <el-button size="small" type="primary" @click="importRemoteRule">导入远程规则</el-button>
        <el-button size="small" type="primary" @click="toCreatePage">新增规则集</el-button>
      </el-col>
    </el-row>
    <el-table border :data="ruleFileList">
      <el-table-column align="center" prop="checked" label="启用" width="60">
        <template v-slot="scope">
          <el-checkbox :checked="scope.row.checked" :disabled="!profile.enableRule" @change="toggleRule(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名字" width="250">
        <template v-slot="scope">
          <meta-tag :isRemote="scope.row.meta.remote" remoteTooltip="远程规则" localTooltip="本地规则" />
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="250" :context="_self">
        <template v-slot="scope">
          <el-tooltip class="item" effect="dark" content="编辑规则" placement="top-start">
            <router-link class="link-btn" :to="'/rule/edit?name=' + scope.row.name">
              <el-button type="info" icon="el-icon-edit" size="mini"></el-button>
            </router-link>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="分享规则" placement="top-start">
            <el-button type="info" icon="el-icon-share" size="mini" @click="downloadRule(scope.row, scope.$index)" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="复制规则" placement="top-start">
            <el-button type="info" icon="el-icon-document" size="mini" @click="copyRule(scope.row, scope.$index)" />
          </el-tooltip>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRule(scope.row, scope.$index)" />
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
import forEach from 'lodash/forEach';
import * as ruleApi from '../../api/rule';
import _ from 'lodash';
import { IRuleFile } from '@core/types/rule';
import { MessageBoxInputData, MessageBoxCloseAction } from 'element-ui/types/message-box';
import { ruleModule, profileModule } from '../../store';
import { IProfileState } from '../../store/profile';
import MetaTag from '../../components/common/MetaTag.vue';

function getReferenceVar(content: any) {
  var contentStr = JSON.stringify(content);
  var reg = RegExp('<%=(.+?)%>', 'g');
  var result;
  var varObj: any = {};
  while ((result = reg.exec(contentStr)) != null) {
    varObj[_.trim(result[1])] = 1;
  }
  return _.keys(varObj);
}

@Component({
  components: {
    'meta-tag': MetaTag,
  },
})
export default class RuleList extends Vue {
  @profileModule.State
  profile: IProfileState[];

  @ruleModule.State('list')
  ruleFileList: IRuleFile[];

  /**
   * 删除规则
   */
  async deleteRule(row: IRuleFile) {
    try {
      await this.$confirm(`此操作将永久删除该文件: ${row.name}, 是否继续?`, '提示', {
        type: 'warning',
      });
      try {
        await ruleApi.deleteRule(row.name);
        this.$message.success('删除成功!');
      } catch (err) {
        this.$message.error(err);
      }
    } catch {
      // no operation
    }
  }

  /**
   * 下载规则
   */
  downloadRule(row: IRuleFile) {
    if (row.meta && !row.meta.remote) {
      window.open(`/rule/download?name=${row.name}`);
    } else {
      this.$alert(row.meta.url as string, '规则URL');
    }
  }

  /**
   * 复制规则
   */
  async copyRule(row: IRuleFile) {
    try {
      await ruleApi.copyRule(row.name);
      this.$message.success('复制成功!');
    } catch (err) {
      this.$message.error(err);
    }
  }

  /**
   * 导入远程文件
   */
  async importRemoteRule() {
    const result = (await this.$prompt('请输入远程规则文件的url', '导入远程规则')) as MessageBoxInputData;
    let url = result.value;
    try {
      const response = await ruleApi.importRemoteRule(url);
      this.$message.success('导入成功');
    } catch (err) {
      this.$message.error(err);
    }
  }

  /**
   * 启用或禁用规则集
   */
  async toggleRule(ruleFile: IRuleFile) {
    try {
      await ruleApi.toggleRule(ruleFile.name, !ruleFile.checked);
      this.$message.success('设置成功!');
    } catch (err) {
      this.$message.error(err);
    }
  }

  /**
   * 跳转到创建页
   */
  toCreatePage() {
    this.$router.push('/rule/create');
  }

  /**
   * 上传文件
   */
  async importLocalRuleFile(evt: MouseEvent) {
    const files = (evt.target as HTMLInputElement).files;

    if (!(files && files[0])) {
      return;
    }
    const file = files[0];

    const reader = new FileReader();
    reader.onload = async e => {
      const contentStr = (e.target as FileReader).result as string;
      const content = JSON.parse(contentStr);

      // 判断是否存在同名规则，如果存在不允许导入
      const finded = _.find(this.ruleFileList, file => {
        return file.name == content.name;
      });
      if (finded) {
        this.$message.error(`已经存在名为${content.name}的规则，请修改规则文件里的name字段,以及文件名`);
        return;
      }
      // 查找引用的变量
      const varNameList = getReferenceVar(content);
      let infoStr = `导入规则文件名为${content.name}`;
      if (varNameList.length > 0) {
        infoStr += `,引用变量【${varNameList.join(',')}】请确保变量已经在转发变量配置中设置过值`;
      }
      const action = (await this.$alert(infoStr, '规则文件导入')) as MessageBoxCloseAction;
      if (action == 'confirm') {
        // 创建文件
        try {
          await ruleApi.saveRule(content.name, content);
          this.$message.success('导入成功');
        } catch (err) {
          this.$message.error(err);
        }
      }
    };
    reader.readAsText(file);
  }
}
</script>
<style lang="scss" scoped>
.addrule-btn-wrap {
  text-align: right;
  float: right;
}

.import-file {
  position: absolute;
  width: 80px;
  height: 28px;
  opacity: 0;
  cursor: pointer;

  &::-webkit-file-upload-button {
    cursor: pointer;
  }
}
</style>
