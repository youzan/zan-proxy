<template>
  <el-collapse v-model="activeNames">
    <!-- basic info -->
    <el-collapse-item title="General" name="general">
      <kv k="Request URL" :v="parsedOriginUrl.href">
        <el-link
          type="primary"
          class="copy-as-curl"
          v-clipboard:copy="curl"
          v-clipboard:success="onCopySuccess"
          v-clipboard:error="onCopyFail"
          >Copy as cURL
        </el-link>
      </kv>
      <kv k="Request Method" :v="currentRecord.request.method || '-'"></kv>
      <kv k="Protocol" :v="protocol"></kv>
      <kv k="HTTP Version" :v="currentRecord.request.httpVersion || '-'"></kv>
    </el-collapse-item>

    <!-- request headers -->
    <el-collapse-item title="Headers" name="headers">
      <kv v-for="(value, key) in requestHeader" :k="key" :v="value" :key="key"></kv>
    </el-collapse-item>

    <!-- request query -->
    <el-collapse-item name="query" v-if="Object.keys(requestQueryParams).length">
      <template slot="title">
        Query
        <el-link class="query-mode-toggle" @click="toggleQueryMode">
          {{ queryMode === 'parsed' ? 'View Source' : 'View Parsed' }}
        </el-link>
      </template>
      <div v-if="queryMode === 'parsed'">
        <kv v-for="(value, key) in requestQueryParams" :k="key" :v="value" :key="key"></kv>
      </div>
      <div v-else>{{ parsedOriginUrl.query }}</div>
    </el-collapse-item>

    <!-- request body -->
    <el-collapse-item title="Body" name="body" v-if="requestBody" v-loading="bodyLoading">{{
      requestBody
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
  font-size: 13px;
  line-height: 18px;
  vertical-align: text-bottom;
}

.query-mode-toggle {
  float: right;
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  line-height: 100%;
  margin-left: 15px;
}
</style>
