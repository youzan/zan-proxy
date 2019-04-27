<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item title="General" name="general">
      <div>
        <kv k="Request URL" :v="parsedOriginUrl.href">
          <a
            class="copy-as-curl"
            v-clipboard:copy="curl"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyFail"
            >Copy as cURL</a
          >
        </kv>
        <kv k="Request Method" :v="currentRecord.request.method || '-'"></kv>
        <kv k="Protocol" :v="protocol"></kv>
        <kv k="HTTP Version" :v="currentRecord.request.httpVersion || '-'"></kv>
      </div>
    </el-collapse-item>
    <el-collapse-item title="Headers" name="headers">
      <div>
        <kv v-for="(value, key) in requestHeader" :k="key" :v="value" :key="key"></kv>
      </div>
    </el-collapse-item>
    <el-collapse-item name="query" v-if="Object.keys(requestQueryParams).length">
      <template slot="title">
        Query
        <span class="query-mode-toggle" @click="toggleQueryMode">
          <span v-if="queryMode === 'parsed'">View Source</span>
          <span v-else>View Parsed</span>
        </span>
      </template>
      <div v-if="queryMode === 'parsed'">
        <kv v-for="(value, key) in requestQueryParams" :k="key" :v="value" :key="key"></kv>
      </div>
      <div v-else>{{ parsedOriginUrl.query }}</div>
    </el-collapse-item>
    <el-collapse-item title="Body" name="body" v-loading="bodyLoading" v-if="requestBody">{{
      requestBody || ''
    }}</el-collapse-item>
  </el-collapse>
</template>

<script lang="ts">
import Vue from 'vue';
import url from 'url';
import qs from 'querystring';
import { Component, Prop } from 'vue-property-decorator';
import KeyValue from './KeyValue.vue';
import { makeCurl } from '../../utils';
import { IClientRecord } from '../../types';
import { Getter } from 'vuex-class';
import { Message } from 'element-ui';

@Component({
  components: {
    kv: KeyValue,
  },
})
export default class Request extends Vue {
  activeNames = ['general', 'headers', 'query', 'body'];
  queryMode = 'parsed';

  @Getter
  currentRecord: IClientRecord;

  @Prop(String)
  requestBody: string;
  @Prop(Boolean)
  bodyLoading: boolean;

  get parsedOriginUrl() {
    return url.parse(this.currentRecord.request.originUrl);
  }

  get protocol() {
    return (this.parsedOriginUrl.protocol && this.parsedOriginUrl.protocol.slice(0, -1)) || 'http';
  }

  get curl() {
    const record = this.currentRecord;
    return makeCurl({
      href: record.request.originUrl,
      method: record.request.method,
      headers: record.request.headers,
      auth: this.parsedOriginUrl.auth || '',
      body: this.requestBody || '',
    });
  }

  get requestHeader() {
    try {
      return this.currentRecord.request.headers || {};
    } catch (e) {
      return {};
    }
  }

  get requestQueryParams() {
    try {
      return qs.parse(this.parsedOriginUrl.query || '');
    } catch (e) {
      return {};
    }
  }

  toggleQueryMode(e: MouseEvent) {
    e.stopPropagation();
    this.queryMode = this.queryMode === 'parsed' ? 'raw' : 'parsed';
  }

  onCopySuccess() {
    this.$message.success('已成功复制到粘贴板!');
  }

  onCopyFail() {
    this.$message.error('复制失败，请重试');
  }
}
</script>

<style lang="scss" scoped>
.copy-as-curl {
  cursor: pointer;
  margin-left: 15px;
  color: #20a0ff;
}

.query-mode-toggle {
  float: right;
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  margin-right: 15px;
}
</style>
