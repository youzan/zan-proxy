<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item title="General" name="general">
      <div>
        <key-value k="Status Code" :v="status"></key-value>
        <key-value k="Response size" :v="size"></key-value>
        <key-value v-if="duration" k="Duration" :v="duration"></key-value>
      </div>
    </el-collapse-item>
    <el-collapse-item title="Headers" name="headers">
      <key-value v-for="(item, index) in responseHeaderList" :k="item[0]" :v="item[1]" :key="index"></key-value>
    </el-collapse-item>
    <body-collapse-item :loading="bodyLoading" :body="responseBody" :contentType="contentType" />
  </el-collapse>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { getStatusText } from 'http-status-codes';
import { Getter } from 'vuex-class';
import _get from 'lodash/get';
import Vue from 'vue';
import prettyTime from 'prettytime';

import BodyCollapseItem from './BodyCollapseItem.vue';
import KeyValue from './KeyValue.vue';
import { IClientRecord } from '../../types';

import { prettySize } from '../../utils';

@Component({
  components: {
    KeyValue,
    BodyCollapseItem,
  },
})
export default class Response extends Vue {
  activeNames: string[] = ['general', 'headers', 'body'];
  bodyMode: 'parsed' | 'raw' = 'parsed';

  @Getter
  currentRecord: IClientRecord;

  @Prop(String)
  responseBody: string;
  @Prop(Boolean)
  bodyLoading: boolean;

  get responseHeaderList() {
    try {
      const headers = Object.assign({}, this.currentRecord.response && this.currentRecord.response.headers);
      const setCookie = headers['set-cookie'] as string[];
      const normalHeaders = Object.keys(headers)
        .filter(key => key !== 'set-cookie')
        .map(key => [key, headers[key]]);

      return setCookie ? [...normalHeaders, ...setCookie.map(scValue => ['set-cookie', scValue])] : normalHeaders;
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

  get duration() {
    const { response } = this.currentRecord;
    return (
      response && prettyTime(response.timeTrack.finishRequest - response.timeTrack.receiveRequest, { short: true })
    );
  }

  get size() {
    const { response } = this.currentRecord;
    return response && prettySize({ size: parseInt(response.headers['content-length'] as string) });
  }

  get contentType(): string {
    return _get(this.currentRecord.response, "headers['content-type']", '');
  }
}
</script>

<style lang="scss" scoped>
.mode-toggle {
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  line-height: 100%;
  margin-left: 15px;
}
</style>
