<template>
  <div class="record-detail" :class="{ show: hasCurrent }">
    <span class="close-button" @click="$emit('close')">
      <i class="el-icon-close"></i>
    </span>
    <el-tabs v-model="activeName" type="border-card" v-if="hasCurrent">
      <el-tab-pane label="Request" name="Request">
        <request :requestBody="requestBody"></request>
      </el-tab-pane>
      <el-tab-pane label="Response" name="Response">
        <response :responseBody="responseBody"></response>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop, Emit, Component } from 'vue-property-decorator';

import Request from './Request.vue';
import Response from './Response.vue';
import { IRecord } from '@core/types/http-traffic';
import { Getter } from 'vuex-class';

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
  currentRow: IRecord;

  requestBody: string;
  responseBody: string;
  activeName: string = 'Request';
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
