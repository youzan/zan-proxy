<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item title="General" name="general">
      <div>
        <kv k="Status Code" :v="status"></kv>
        <kv k="Response size" :v="currentRecord.response.size"></kv>
        <kv k="Duration" :v="currentRecord.response.duration"></kv>
      </div>
    </el-collapse-item>
    <el-collapse-item title="Headers" name="headers">
      <kv v-for="(item, index) in responseHeaderList" :k="item[0]" :v="item[1]" :key="index"></kv>
    </el-collapse-item>
    <el-collapse-item name="body" v-if="responseBody">
      <template slot="title">
        Body
        <span class="body-mode-toggle" @click="toggleBodyMode">
          <span v-if="bodyMode === 'parsed'">View Source</span>
          <span v-else>View Parsed</span>
        </span>
      </template>
      <json-tree v-if="bodyMode === 'parsed' && contentType.includes('json')" :data="responseBody"></json-tree>
      <div v-else>{{ responseBody }}</div>
    </el-collapse-item>
  </el-collapse>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
// @ts-ignore
import JsonTree from 'vue-json-tree';
import _get from 'lodash/get';
import Vue from 'vue';

import KeyValue from './KeyValue.vue';
import { Getter } from 'vuex-class';
import { IRecord } from '@core/types/http-traffic';
import { getStatusText } from 'http-status-codes';

@Component({
  components: {
    kv: KeyValue,
    'json-tree': JsonTree,
  },
})
export default class Response extends Vue {
  activeNames: string[] = ['general', 'headers', 'body'];
  bodyMode: 'parsed' | 'raw' = 'parsed';

  @Prop(String)
  responseBody: string;

  @Getter
  currentRecord: IRecord;

  get responseHeader() {
    try {
      const headers = Object.assign({}, _get(this.currentRecord.response, 'headers'));
      delete headers['set-cookie'];
      return headers;
    } catch (e) {
      return {};
    }
  }

  get responseHeaderList() {
    try {
      const headers = Object.assign(
        {},
        this.currentRecord && 'response' in this.currentRecord && this.currentRecord.response.headers,
      );
      const setCookie = headers['set-cookie'] as string[];
      delete headers['set-cookie'];
      return Object.keys(headers)
        .map(key => [key, headers[key]])
        .concat(setCookie.map(scValue => ['set-cookie', scValue]));
    } catch (e) {
      return {};
    }
  }

  get status() {
    if (!this.currentRecord.response || !this.currentRecord.response.statusCode) {
      return '';
    }
    const statusCode = this.currentRecord.response.statusCode;
    return `${statusCode} ${getStatusText(statusCode)}`;
  }

  get contentType() {
    return _get(this.currentRecord.response, "headers['content-type']");
  }

  toggleBodyMode(e: MouseEvent) {
    e.stopPropagation();
    this.bodyMode = this.bodyMode === 'parsed' ? 'raw' : 'parsed';
  }
}
</script>

<style lang="scss" scoped>
.body-mode-toggle {
  float: right;
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  margin-right: 15px;
}
</style>
