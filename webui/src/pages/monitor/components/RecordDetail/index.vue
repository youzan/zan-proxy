<template>
  <div class="record-detail" :class="{ show: hasCurrent }">
    <span class="close-button" @click="$emit('close')">
      <i class="el-icon-close"></i>
    </span>
    <el-tabs v-model="activeName" type="border-card" v-if="hasCurrent">
      <el-tab-pane label="Request" name="Request">
        <request :requestBody="requestBody" :bodyLoading="fetchingRequestBody"></request>
      </el-tab-pane>
      <el-tab-pane label="Response" name="Response">
        <response :responseBody="responseBody" :bodyLoading="fetchingResponseBody"></response>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop, Emit, Component, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import Request from './Request.vue';
import Response from './Response.vue';
import { IClientRecord } from '../../types';
import * as api from '../../api';

@Component({
  components: {
    request: Request,
    response: Response,
  },
})
export default class RecordDetail extends Vue {
  @Getter
  hasCurrent: boolean;
  @Getter
  currentRecord: IClientRecord;

  requestBody: string = '';
  fetchingRequestBody: boolean = false;

  responseBody: string = '';
  fetchingResponseBody: boolean = false;

  activeName: string = 'Request';

  async fetchRequestBody(id: number) {
    this.fetchingRequestBody = true;
    const data = await api.getRequestBody(id);
    this.requestBody = data;
    this.fetchingRequestBody = false;
  }

  async fetchResponseBody(id: number) {
    this.fetchingResponseBody = true;
    const data = await api.getResponseBody(id);
    this.responseBody = data;
    this.fetchingResponseBody = false;
  }

  @Watch('currentRecord')
  fetchRecordBody() {
    this.requestBody = '';
    this.responseBody = '';

    if (!this.currentRecord) {
      return;
    }

    const { id, request } = this.currentRecord;
    if (request.method === 'POST') {
      this.fetchRequestBody(id);
    }
    this.fetchResponseBody(id);
  }
}
</script>

<style lang="scss" scoped>
.record-detail {
  background-color: #fff;
  height: 100%;
  position: fixed;
  top: 0;
  left: 100%;
  width: 600px;
  box-shadow: -2px 0px 2px 1px rgba(0, 0, 0, 0.2);
  z-index: 9;
  background-color: #eef1f6;
  transition: left 0.5s;
  overflow-y: auto;
  word-break: break-all;

  &.show {
    left: calc(100% - 600px);
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 30px;
    z-index: 10;
    cursor: pointer;
    color: rgb(115, 115, 115);
  }
}
</style>
