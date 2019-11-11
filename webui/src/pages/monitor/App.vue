<template>
  <div id="app" class="app">
    <div class="action-bar">
      <div class="buttons">
        <el-button @click="toggleRecordState" v-if="stopRecord" type="primary" icon="el-icon-video-play"
          >记录</el-button
        >
        <el-button @click="toggleRecordState" v-else type="danger" icon="el-icon-video-pause">停止</el-button>
        <el-button icon="el-icon-delete" @click="requestClear">清空</el-button>
      </div>
      <div class="filter-input">
        <el-input v-model="filter" placeholder="设置过滤条件" suffix-icon="el-icon-search"></el-input>
      </div>
    </div>
    <div class="monitor">
      <record-table @select="setSelectId"></record-table>
      <record-detail @close="setSelectId('')"></record-detail>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import url from 'url';
import io from 'socket.io-client';
import RecordTable from './components/RecordTable/index.vue';
import RecordDetail from './components/RecordDetail/index.vue';
import * as trafficApi from './api';
import { Component, Watch } from 'vue-property-decorator';
import Vue from 'vue';
import { State, Getter, Action, Mutation } from 'vuex-class';
import { IRecord } from '@core/types/http-traffic';
import { IRecordMap } from './types';

@Component({
  components: {
    'record-table': RecordTable,
    'record-detail': RecordDetail,
  },
})
export default class App extends Vue {
  @State
  selectId: string;
  @State
  recordMap: IRecordMap;
  @State
  filteredIds: number[];

  @Getter
  hasCurrent: boolean;

  filter: string = ''; // 过滤字段
  stopRecord: boolean = false; // 停止记录
  requestingClear: boolean = false; // 正在请求清除记录

  /**
   * 切换监听或停止状态
   */
  toggleRecordState() {
    this.stopRecord = !this.stopRecord;
  }

  /**
   * 清空记录
   */
  async requestClear() {
    this.requestingClear = true;
    this.clear();
    await trafficApi.clear();
    this.requestingClear = false;
  }

  /**
   * 接收 node 端的记录信息
   */
  receiveTrafficRecords(records: IRecord[]) {
    if (this.stopRecord || this.requestingClear) return;
    _.forEach(records, record => {
      const id = record.id;
      const hasRecieved = !!this.recordMap[id];

      this.modifyRecordMap({ id, record: hasRecieved ? { ...this.recordMap[id], ...record } : record });

      // 根据host、path进行过滤
      const request = record.request;
      if (request && request.originUrl.includes(this.filter)) {
        this.addFilteredId(id);
      }
    });
  }

  @Mutation
  setRecordMap: (recordMap: IRecordMap) => void;
  @Mutation
  modifyRecordMap: (payload: { id: number; record: IRecord }) => void;
  @Mutation
  setSelectId: (id: string) => void;

  @Mutation
  setFilteredIds: (ids: number[]) => void;
  @Mutation
  addFilteredId: (id: number) => void;

  @Mutation
  clear: () => void;

  // 监听过滤器变化
  @Watch('filter', {
    immediate: false,
  })
  onFilterChanged(val: string, oldVal: string) {
    const filteredIds: number[] = Object.keys(this.recordMap)
      .filter(id => {
        const r = this.recordMap[id];
        return r.request.originUrl.includes(this.filter);
      })
      .map(Number);
    this.setFilteredIds(filteredIds);
  }

  created() {
    let socket = io('/http-trafic');
    socket.on('records', this.receiveTrafficRecords);
  }
}
</script>

<style lang="scss" scoped>
.app {
  overflow: hidden;
}

.monitor {
  display: flex;
  flex: 1;
  position: fixed;
  top: 60px;
  width: 100%;
}

.action-bar {
  padding: 10px 20px;
  display: flex;
  width: 100%;
  position: fixed;

  .buttons {
    display: flex;
    padding-right: 20px;
    border-right: 1px solid #e1e3e6;
    margin-right: 20px;
  }

  .filter-input {
    width: 250px;
  }
}
</style>
