<template>
  <div style="text-align: left; flex:1;">
    <!-- 动作，空文件 -->
    <div class="inline-block left-panel">
      <!-- 动作类型 -->
      <el-select
        v-model="action.type"
        placeholder="请选择"
        style="margin-right: 10px;font-size: 12px"
        size="small"
        :disabled="remote"
      >
        <el-option v-for="item in ruleType" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </div>
    <!-- 参数设置- 请求转发 -->
    <div v-if="action.type == 'redirect'" class="inline-block right-panel">
      <div class="action-data">
        <el-input
          v-model.trim="action.data.target"
          size="small"
          :disabled="remote"
          placeholder="远程地址(以http/https开头)、本地地址"
        ></el-input>
      </div>
    </div>
    <!-- 参数设置- 返回自定义数据 el-select的一个bug，当el-select从界面中消失的时候会解绑事件。。所以用v-show -->
    <div v-show="action.type == 'mockData'" class="inline-block right-panel">
      <div class="action-data">
        <span>
          <el-select
            v-model="action.data.dataId"
            style="width: 200px"
            size="small"
            filterable
            placeholder="请选择要返回的数据"
          >
            <el-option
              v-for="dataentry in mockList"
              :label="dataentry.name"
              :key="dataentry.id"
              :value="dataentry.id"
            ></el-option>
          </el-select>
        </span>
        <span style="margin-left: 10px;">
          <el-button type="text" @click="toMockPage">去编辑Mock数据</el-button>
        </span>
      </div>
    </div>
    <!-- 增加请求头 -->
    <div v-if="action.type == 'addRequestHeader'" class="inline-block right-panel">
      <div class="action-data">
        <el-input
          v-model="action.data.headerKey"
          size="small"
          :disabled="remote"
          placeholder="header key"
          class="header-input"
        ></el-input>
        <el-input
          v-model="action.data.headerValue"
          size="small"
          :disabled="remote"
          placeholder="header value"
          class="header-input"
        ></el-input>
      </div>
    </div>
    <!-- 增加响应头 -->
    <div v-if="action.type == 'addResponseHeader'" class="inline-block right-panel">
      <div class="action-data">
        <el-input
          v-model="action.data.headerKey"
          size="small"
          :disabled="remote"
          placeholder="header key"
          class="header-input"
        ></el-input>
        <el-input
          v-model="action.data.headerValue"
          size="small"
          :disabled="remote"
          placeholder="header value"
          class="header-input"
        ></el-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import 'vue-router';
import { Component, Watch, Prop } from 'vue-property-decorator';
import { IRuleFile, IRule, IRuleAction } from '@core/types/rule';
import _ from 'lodash';
import { mockModule } from '../../store';
import { IMockRecord } from '@core/types/mock';

@Component
export default class RuleAction extends Vue {
  @Prop()
  action: IRuleAction;

  @Prop()
  remote: boolean;

  @mockModule.State('list')
  mockList: IMockRecord[];

  ruleType = [
    { value: 'redirect', label: '转发请求' },
    { value: 'mockData', label: '返回自定义数据' },
    { value: 'addRequestHeader', label: '增加请求头' },
    { value: 'addResponseHeader', label: '增加响应头' },
    { value: 'empty', label: '返回空文件' },
  ];

  toMockPage() {
    this.$router.push('/mock');
  }
}
</script>
<style lang="scss" scoped>
.inline-block {
  display: inline-block;
}

.conditon {
  margin-top: 10px;
}

.conditon:after {
  content: '';
  display: block;
  border-bottom: 1px dotted #adadad;
}

.action {
  margin-bottom: 10px;
}

.left-panel {
  width: 160px;
  vertical-align: top;
}

.right-panel {
  width: calc(100% - 170px);
  padding-left: 10px;
}

.action-data {
  text-align: left;
}

.action-option {
  margin-top: 5px;
}

.header-input {
  display: inline-block;
  width: 120px;
  margin-right: 10px;
}
</style>
