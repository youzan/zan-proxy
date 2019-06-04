<template>
  <el-collapse v-model="activeNames">
    <!-- basic info -->
    <el-collapse-item title="General" name="general">
      <key-value k="Request URL" :v="parsedOriginUrl.href">
        <el-link
          type="primary"
          class="copy-as-curl"
          v-clipboard:copy="curl"
          v-clipboard:success="onCopySuccess"
          v-clipboard:error="onCopyFail"
        >Copy as cURL</el-link>
      </key-value>
      <key-value k="Request Method" :v="currentRecord.request.method || '-'"></key-value>
      <key-value k="Protocol" :v="protocol"></key-value>
      <key-value k="HTTP Version" :v="currentRecord.request.httpVersion || '-'"></key-value>
    </el-collapse-item>

    <!-- request headers -->
    <el-collapse-item title="Headers" name="headers">
      <key-value v-for="(value, key) in requestHeader" :k="key" :v="value" :key="key"></key-value>
    </el-collapse-item>

    <!-- request query -->
    <el-collapse-item name="query" v-if="Object.keys(requestQueryParams).length">
      <template slot="title">
        Query
        <el-link
          class="mode-toggle"
          @click="toggleQueryMode"
        >{{ queryMode === 'parsed' ? 'View Source' : 'View Parsed' }}</el-link>
      </template>
      <div v-if="queryMode === 'parsed'">
        <key-value v-for="(value, key) in requestQueryParams" :k="key" :v="value" :key="key"></key-value>
      </div>
      <div v-else>{{ parsedOriginUrl.query }}</div>
    </el-collapse-item>

    <!-- request body -->
    <body-collapse-item :loading="bodyLoading" :body="requestBody" :contentType="contentType"/>
  </el-collapse>
</template>

<script lang="ts">
import Vue from 'vue';
import url from 'url';
import qs from 'querystring';
import { Component, Prop } from 'vue-property-decorator';
import KeyValue from './KeyValue.vue';
import BodyCollapseItem from './BodyCollapseItem.vue';
import _get from 'lodash/get';
import { makeCurl } from '../../utils';
import { IClientRecord } from '../../types';
import { Getter } from 'vuex-class';
import { Message } from 'element-ui';

@Component({
  components: {
    KeyValue,
    BodyCollapseItem,
  },
})
export default class Request extends Vue {
  activeNames = ['general', 'headers', 'query', 'body'];
  queryMode = 'parsed';
  bodyMode = 'parsed';

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

  get contentType() {
    return _get(this.currentRecord.request, "headers['content-type']", '');
  }

  toggleQueryMode(e: MouseEvent) {
    e.stopPropagation();
    this.queryMode = this.queryMode === 'parsed' ? 'raw' : 'parsed';
  }

  toggleBodyMode(e: MouseEvent) {
    e.stopPropagation();
    this.bodyMode = this.bodyMode === 'parsed' ? 'raw' : 'parsed';
  }

  onCopySuccess() {
    Message.success('已成功复制到粘贴板!');
  }

  onCopyFail() {
    Message.error('复制失败，请重试');
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

.mode-toggle {
  float: right;
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  line-height: 100%;
  margin-left: 15px;
}
</style>
