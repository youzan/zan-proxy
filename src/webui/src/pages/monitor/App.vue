<template>
  <div id="app" class="app">
    <div class="action-bar">
      <div class="buttons">
        <el-button @click="requestToggleRecordState" v-if="!state.stopRecord" type="danger">
          <i class="icon-stop" />
          <span>停止</span>
        </el-button>
        <el-button @click="requestToggleRecordState" v-else type="primary" icon="caret-right">记录</el-button>
        <el-button icon="delete" @click="requestClear">清空</el-button>
      </div>
      <div class="filter-input">
        <el-input v-model="filter" placeholder="记录过滤条件" icon="search"></el-input>
      </div>
    </div>
    <div class="monitor">
      <record-table @select="setCurrentRowIndex"></record-table>
      <record-detail @close="setCurrentRowIndex(null)"></record-detail>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import url from 'url';
import io from 'socket.io-client';
import RecordTable from './components/RecordTable';
import RecordDetail from './components/RecordDetail';
import * as trafficApi from './api';

export default {
  components: {
    'record-table': RecordTable,
    'record-detail': RecordDetail,
  },
  data() {
    return {
      isDataCenter: true, // 当前选择的记录
      recordMap: {}, // 当前所有记录
      originRecordArray: [], // 原始记录数组 存放记录id
      filterdRecordArray: [], // 过滤后的数组 存放记录id
      selectId: '', //当前选择的记录
      rightClickId: '', // 右击的id
      currentRequestBody: '', // 选择记录的请求body
      currentResponseBody: '', // 选择记录的响应body
      requestingClear: false, // 请求清除记录
      state: {
        stopRecord: false, // 停止记录
        overflow: false, // 达到最大记录数显示
      },
      filter: '',
    };
  },
  computed: {
    total() {
      return this.filterdRecordArray.length;
    },
    hasCurrent() {
      return !!this.recordMap[this.selectId];
    },
    currentRow() {
      return this.recordMap[this.selectId];
    },
    rightClickRow() {
      return this.recordMap[this.rightClickId];
    }, // 原始请求的header键值对
    originRequestHeader() {
      try {
        return this.currentRow.originRequest.headers;
      } catch (e) {
        return {};
      }
    },
    originRequestCookie() {
      try {
        return trafficApi.parseCookie(this.currentRow.originRequest.headers.cookie || '');
      } catch (e) {
        return {};
      }
    },
    originRequestQueryParams() {
      try {
        return trafficApi.parseQuery(this.currentRow.originRequest.path);
      } catch (e) {
        return {};
      }
    }, // 当前请求的header键值对
    requestHeader() {
      try {
        return this.currentRow.requestData.headers;
      } catch (e) {
        return {};
      }
    },
    requestCookie() {
      try {
        return trafficApi.parseCookie(this.currentRow.requestData.headers.cookie || '');
      } catch (e) {
        return {};
      }
    },
    requestQueryParams() {
      try {
        return trafficApi.parseQuery(this.currentRow.requestData.path);
      } catch (e) {
        return {};
      }
    },

    responseHeader() {
      try {
        let headers = Object.assign({}, this.currentRow.response.headers);
        delete headers['set-cookie'];
        return headers;
      } catch (e) {
        return {};
      }
    },
    responseHeaderList() {
      try {
        const headers = Object.assign({}, this.currentRow.response.headers);
        const setCookie = headers['set-cookie'];
        delete headers['set-cookie'];
        return Object.keys(headers)
          .map(key => [key, headers[key]])
          .concat(setCookie.map(scValue => ['set-cookie', scValue]));
      } catch (e) {
        return {};
      }
    },
    setCookies() {
      try {
        return this.currentRow.response.headers['set-cookie'] || [];
      } catch (e) {
        return [];
      }
    },

    timeline() {
      return {
        请求: '',
      };
    },
  },
  methods: {
    /**
     * 切换监听或停止状态
     */
    requestToggleRecordState() {
      this.state.stopRecord = !this.state.stopRecord;
      trafficApi.setStopRecord(this.state.stopRecord);
    },
    /**
     * 清空记录
     */
    requestClear() {
      this.requestingClear = true;
      this.clear();
      trafficApi.clear();
    },
    /**
     * 根据条件过滤记录
     */
    filterRecords() {
      let filtered = [];
      this.originRecordArray.forEach(id => {
        let r = this.recordMap[id];
        let originRequest = r.originRequest;
        if (originRequest && originRequest.href.includes(this.filter)) {
          filtered.push(r.id);
        }
      });
      this.filterdRecordArray = filtered;
    },
    receiveTraffic(rows) {
      if (this.state.stopRecord || this.requestingClear) return;
      _.forEach(rows, row => {
        let id = row.id;
        let hasRecieved = !!this.recordMap[id];
        let record = this.recordMap[id] || {};
        Object.assign(record, row);

        this.$set(this.recordMap, id, record);

        if (!hasRecieved) {
          this.originRecordArray.push(id);
        }
        // 根据host、path进行过滤
        let originRequest = row.originRequest;
        if (originRequest && originRequest.href.includes(this.filter)) {
          this.filterdRecordArray.push(id);
        }
      });
    },
    async setCurrentRowIndex(id) {
      if (this.selectId == id) return;
      this.selectId = id;
      this.currentRequestBody = '';
      this.currentResponseBody = '';
      let currentRow = this.recordMap[id];
      if (!currentRow) {
        return;
      }
      if (currentRow.originRequest.method === 'POST') {
        // 请求后端 拿数据
        this.currentRequestBody = await trafficApi.getRequestBody(id);
      }
      // 如果是html json数据 向后端请求拿数据
      try {
        if (/(text)|(javascript)|(json)/i.test(currentRow.response.headers['content-type'])) {
          // 请求后端 拿数据
          this.currentResponseBody = await trafficApi.getResponseBody(id);
        }
      } catch (e) {
        console.log(e);
      }
    },
    setRightClickedRecordId(id) {
      this.rightClickId = id;
    },
    setFilter(filter) {
      this.filter = filter;
    },
    setState(state) {
      this.state = state;
    },
    clear() {
      this.recordMap = {};
      this.originRecordArray = [];
      this.filterdRecordArray = [];
      this.currentRequestBody = '';
      this.currentResponseBody = '';
    },
  },
  watch: {
    // 监听过滤器变化
    filter: {
      handler: _.debounce(function() {
        // 过滤
        this.filterRecords();
        trafficApi.setFilter(this.filter);
      }, 1000),
      deep: true,
    },
  },
  created() {
    let socket = io('/httptrafic');
    socket.on('rows', this.receiveTraffic);
    socket.on('filter', filter => {
      this.setFilter(filter);
    });
    socket.on('state', this.setState);
    socket.on('clear', () => {
      this.requestingClear = false;
      this.clear();
    });
  },
};
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
