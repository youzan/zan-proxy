<template>
  <el-table
    class="record-list"
    :data="records"
    stripe
    border
    height="calc(100vh - 60px)"
    :row-class-name="getTableRowClassName"
    @row-click="onRowClicked"
  >
    <!-- Url -->
    <el-table-column label="Url">
      <template v-slot="scope">
        <div class="url-container">
          <div class="name text">{{ scope.row.urlText }}</div>
          <div class="sub-text">{{ scope.row.hostpath }}</div>
        </div>
      </template>
    </el-table-column>

    <!-- Method -->
    <el-table-column label="Method" width="150" prop="method"></el-table-column>

    <!-- Response Status -->
    <el-table-column label="Status" width="150">
      <template v-slot="scope">
        <div class="status-container">
          <div class="code text">{{ scope.row.statusCode || '--' }}</div>
          <div class="sub-text">{{ scope.row.statusText || '' }}</div>
        </div>
      </template>
    </el-table-column>

    <!-- Content-Type -->
    <el-table-column label="Content-Type" width="200">
      <template v-slot="scope">
        <div class="content-type-container">
          <div class="type text">{{ scope.row.contentTypeText || '--' }}</div>
          <div class="sub-text">{{ scope.row.contentType || '' }}</div>
        </div>
      </template>
    </el-table-column>

    <!-- Response Size -->
    <el-table-column label="Size" width="150">
      <template v-slot="scope">
        <div class="size-container">
          <div class="size text">{{ scope.row.size || '--' }}</div>
        </div>
      </template>
    </el-table-column>

    <!-- Request Duration -->
    <el-table-column label="Duration" width="150">
      <template v-slot="scope">
        <div class="duration-container">
          <div class="duration text">{{ scope.row.duration || '--' }}</div>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import Vue from 'vue';
import url from 'url';
import { Prop, Emit, Component } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import { getStatusText } from 'http-status-codes';
import prettyTime from 'prettytime';

import { getContextTypeText, prettySize } from '../../utils';
import { IRecordMap, IClientRecord } from '../../types';

@Component
export default class RecordTable extends Vue {
  @State
  recordMap: IRecordMap;
  @State
  filteredIds: number[];

  @Getter
  currentRecord: IClientRecord;

  getTableRowClassName({ row }: { row: IClientRecord; rowIndex: number }) {
    if (this.currentRecord && row.id === this.currentRecord.id) {
      return 'record-row record-row__selected';
    }
    return 'record-row';
  }

  @Emit('select')
  onRowClicked(row: IClientRecord) {
    return row.id;
  }

  get records() {
    const { recordMap, filteredIds } = this;
    return filteredIds.map(id => {
      const record = recordMap[id];
      const { request, response } = record;
      const parsedOriginUrl = url.parse((request && request.originUrl) || '');
      const splited = (parsedOriginUrl.pathname && parsedOriginUrl.pathname.split('/')) || [];
      const { search, port, hostname } = parsedOriginUrl;
      return {
        id,
        urlText: (splited.slice(-1).join('') || '') + (search || '') || '/',
        method: request && request.method,
        hostpath: (port ? `${hostname}:${port}` : parsedOriginUrl.hostname) + splited.slice(0, -1).join('/'),
        statusCode: response && response.statusCode,
        statusText: response && getStatusText(response.statusCode),
        contentType: response && response.headers['content-type'],
        contentTypeText: response && getContextTypeText(response.headers['content-type'] as string),
        size: response && prettySize({ size: parseInt(response.headers['content-length'] as string) }),
        duration:
          response && prettyTime(response.timeTrack.finishRequest - response.timeTrack.receiveRequest, { short: true }),
      };
    });
  }
}
</script>

<style lang="scss" scoped>
.text {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-text {
  color: #aaa;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style lang="scss">
.record-row {
  cursor: pointer;

  &__selected td {
    color: #fff;
    background-color: #67abff !important;

    .sub-text {
      color: #fff;
    }
  }
}
</style>
