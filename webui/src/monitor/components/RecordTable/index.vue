<template>
  <el-table
    :data="records"
    stripe
    border
    :row-class-name="tableRowClassName"
    @row-click="onRowClicked"
  >
      <el-table-column
        label="Name"
      >
        <template scope="scope">
            <div class="name-container" :title="scope.row.originRequest.href">
              <div class="name text">
                {{ scope.row.name }}
              </div>
              <div class="foot">
                {{ scope.row.hostpath }}
              </div>
            </div>
        </template>
      </el-table-column>
      <el-table-column
        label="Status"
        width="180"
      >
        <template scope="scope">
          <div class="status-container">
            <div class="code text">
              {{ scope.row.response && scope.row.response.statusCode || '--' }}
            </div>
            <div class="foot">
              {{ scope.row.response && scope.row.response.statusText || '' }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="Type"
        width="180"
      >
        <template scope="scope">
          <div class="type-container">
            <div class="type text">
              {{ scope.row.response && scope.row.response.contentTypeText || '--' }}
            </div>
            <div class="foot">
              {{ scope.row.response && scope.row.response.contentType || '' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="Method"
        width="180"
        prop="originRequest.method"
      >
      </el-table-column>
      <el-table-column
        label="Size"
        width="180"
      >
        <template scope="scope">
          <div class="size-container">
            <div class="size text">
              {{ scope.row.response && scope.row.response.size || '--' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="Duration"
      >
        <template scope="scope">
          <div class="duration-container">
            <div class="duration text">
              {{ scope.row.response && scope.row.response.duration || '--' }}
            </div>
          </div>
        </template>
      </el-table-column>
  </el-table>
</template>

<script>

import { getStatusText } from 'http-status-codes'

import prettySize from './prettySize'
import prettyTime from 'prettytime'

const contentTypeText = {
  'html': 'Document',
  'javascript': 'Script',
  'css': 'Stylesheet',
  'font': 'Font',
  'json': 'JSON',
  'png': 'PNG',
  'jpg': 'JPEG',
  'gif': 'GIF'              
}

export default {
  methods: {
    tableRowClassName(row) {
      if (this.$dc.currentRow && row.id === this.$dc.currentRow.id) {
        return 'record-selected'
      }
      return ''
    },
    onRowClicked(row) {
      this.$emit('select', row.id)
    }
  },
  computed: {
    records() {
      const { recordMap, filterdRecordArray } = this.$dc
      return filterdRecordArray.map(id => {
        const record = recordMap[id]
        const splited = record.originRequest.pathname.split('/')
        record.name = record.originRequest.search || ''
        record.hostpath = record.originRequest.hostname || ''
        if (record.originRequest.port) {
          record.hostpath += `:${record.originRequest.port}`
        }
        if (splited.length) {
          record.name = splited.slice(-1)[0] + record.name
        }
        if (!record.name) {
          record.name = '/'
        }
        if (splited.length > 1) {
          record.hostpath += splited.slice(0, -1).join('/')
        }
        if (record.response && record.response.statusCode) {
          record.response.statusText = getStatusText(record.response.statusCode)
        }
        if (record.response && record.response.headers) {
          const { headers } = record.response
          Object.keys(headers).forEach((k) => {
            headers[k.toLowerCase()] = headers[k]
          })
          if (headers['content-type']) {
            const contentType = headers['content-type']
            record.response.contentType = contentType
            record.response.contentTypeText = 'XHR'
            Object.keys(contentTypeText).forEach(k => {
              if (contentType.includes(k)) {
                record.response.contentTypeText = contentTypeText[k]
              }
            })
          }
          if (headers['content-length']) {
            record.response.size = prettySize(headers['content-length'])
          }
        }
        if (record.response && record.response.receiveRequestTime && record.response.requestEndTime) {
          record.response.duration = prettyTime(record.response.requestEndTime - record.response.receiveRequestTime)
        }
        return record
      })
    }
  }
}
</script>

<style>
  .record-selected td {
    color: #fff;
    background-color: #20a0ff !important;
  }
  .record-selected td .foot {
    color: #fff !important;
  }
  .el-table__row {
    cursor: pointer;
  }
</style>

<style scoped>
  .text {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .foot {
    color: #aaa;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>



