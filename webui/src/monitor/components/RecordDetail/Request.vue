<template>
    <el-collapse v-model="activeNames">
  <el-collapse-item title="General" name="general">
    <div>
        <kv k="Request URL" :v="href"></kv>
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

import KeyValue from "./KeyValue";
import ObjKV from './ObjKV'

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
    },
    methods: {
        toggleQueryMode(e) {
            e.stopPropagation();
            this.queryMode = this.queryMode === 'parsed' ? 'raw' : 'parsed'
        }
    }
}
</script>

<style scoped>

</style>
