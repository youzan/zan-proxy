<template>
  <div id="app" class="app">
    <div class="action-bar">
      <div class="buttons">
        <el-button @click="toggleRecordState" v-if="!stopRecord" type="danger">
          <i class="icon-stop" />
          <span>停止</span>
        </el-button>
        <el-button @click="toggleRecordState" v-else type="primary" icon="caret-right">记录</el-button>
        <el-button icon="delete" @click="requestClear">清空</el-button>
      </div>
      <div class="filter-input">
        <el-input v-model="filter" placeholder="设置过滤条件" icon="search"></el-input>
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
import { IRecordMap } from './store';

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
  recordMap: {
    [id: string]: IRecord;
  };
  @State
  filteredIds: number[];

  @Getter
  hasCurrent: boolean;
  @Getter
  currentRow: IRecord;

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
  requestClear() {
    this.requestingClear = true;
    this.clear();
    trafficApi.clear();
  }

  /**
   * 根据条件过滤记录
   */
  filterRecords = _.debounce(() => {
    let filteredIds: number[] = [];
    Object.keys(this.recordMap).forEach(id => {
      const r = this.recordMap[id];
      if (r.request.originUrl.includes(this.filter)) {
        filteredIds.push(r.id);
      }
    });
    this.setFilteredIds(filteredIds);
  }, 1000);

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
      console.log(request);
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
    // 过滤
    this.filterRecords();
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
}

.action-bar {
  padding: 10px 20px;
  display: flex;
  width: 100%;

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

.icon-stop {
  width: 12px;
  height: 12px;
  display: inline-block;
  border-radius: 2px;
  background-color: #fff;
  vertical-align: middle;
  margin-right: 7px;
  line-height: 1;
}
</style>
