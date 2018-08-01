<template>
    <el-collapse v-model="activeNames">
  <el-collapse-item title="General" name="general">
    <div>
        <kv k="Request URL" :v="href">
            <a class="copy-as-curl"
                v-clipboard:copy="curl"
                v-clipboard:success="onCopySuccess"
                v-clipboard:error="onCopyFail"
            >Copy as cURL</a>
        </kv>
        <kv k="Request Method" :v="method"></kv>
        <kv k="Protocol" :v="protocol"></kv>
        <kv k="HTTP Version" :v="httpVersion"></kv>
    </div>
  </el-collapse-item>
  <el-collapse-item title="Headers" name="headers">
    <obj-kv :obj="$dc.requestHeader"></obj-kv>
  </el-collapse-item>
  <el-collapse-item name="query" v-if="Object.keys($dc.requestQueryParams).length">
      <template slot="title">
          Query
          <span class="toggle-mode-button" @click="toggleQueryMode">
            <span v-if="queryMode === 'parsed'">View Source</span>
            <span v-else>View Parsed</span>
          </span>
      </template>
      <obj-kv :obj="$dc.requestQueryParams" v-if="queryMode === 'parsed'"></obj-kv>
      <div v-else>{{ $dc.currentRow.originRequest.query }}</div>
  </el-collapse-item>
  <el-collapse-item title="Body" name="body" v-if="$dc.currentRequestBody">

      {{ $dc.currentRequestBody || '' }}
  </el-collapse-item>
</el-collapse>
</template>

<script>

import KeyValue from "./KeyValue"
import ObjKV from './ObjKV'
import makeCURL from './makeCURL'

export default {
    data() {
        return {
            activeNames: ['general', 'headers', 'query', 'body'],
            queryMode: 'parsed'
        }
    },
    components: {
        'kv': KeyValue,
        'obj-kv': ObjKV,
    },
    computed: {
        href() {
            return this.$dc.currentRow.originRequest && this.$dc.currentRow.originRequest.href || ''
        },
        method() {
            return this.$dc.currentRow.originRequest && this.$dc.currentRow.originRequest.method || ''
        },
        protocol() {
            return this.$dc.currentRow.originRequest && this.$dc.currentRow.originRequest.protocol.slice(0, -1) || 'http'
        },
        httpVersion() {
            return this.$dc.currentRow.originRequest && this.$dc.currentRow.originRequest.httpVersion || ''
        },
        curl() {
            const data = this.$dc.currentRow
            return makeCURL({
                ...data.originRequest,
                body: this.$dc.currentRequestBody || '',
            })
        }
    },
    methods: {
        toggleQueryMode(e) {
            e.stopPropagation();
            this.queryMode = this.queryMode === 'parsed' ? 'raw' : 'parsed'
        },
        onCopySuccess() {
            this.$message({
                type: 'success',
                message: '已成功复制到粘贴板!'
            });
        },
        onCopyFail() {
            this.$message.error('复制失败，请重试')
        }
    }
}
</script>

<style scoped>
    .copy-as-curl {
        cursor: pointer;
        margin-left: 15px;
        color: #20a0ff;
    }
</style>
