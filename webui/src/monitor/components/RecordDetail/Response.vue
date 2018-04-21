<template>
    <el-collapse v-model="activeNames">
  <el-collapse-item title="General" name="general">
    <div>
        <kv k="Status Code" :v="status"></kv>
        <kv k="Response size" :v="$dc.currentRow.response.size"></kv>
        <kv k="Duration" :v="$dc.currentRow.response.duration"></kv>
    </div>
  </el-collapse-item>
  <el-collapse-item title="Headers" name="headers">
    <obj-kv :obj="$dc.responseHeader"></obj-kv>
  </el-collapse-item>
  <el-collapse-item name="body" v-if="$dc.currentResponseBody">
      <template slot="title">
          Body
          <span class="toggle-mode-button" @click="toggleBodyMode">
            <span v-if="bodyMode === 'parsed'">View Source</span>
            <span v-else>View Parsed</span>
          </span>
      </template>
      <json-tree v-if="bodyMode === 'parsed' && contentType.includes('json')" :data="$dc.currentResponseBody"></json-tree>
      <div v-else>{{ $dc.currentResponseBody }}</div>
  </el-collapse-item>
</el-collapse>
</template>

<script>

import KeyValue from "./KeyValue";
import ObjKV from './ObjKV'
import JsonTree from 'vue-json-tree'
export default {
    data() {
        return {
            activeNames: ['general', 'headers', 'body'],
            bodyMode: 'parsed'
        }
    },
    components: {
        'kv': KeyValue,
        'obj-kv': ObjKV,
        'json-tree': JsonTree
    },
    computed: {
        status() {
            if (!this.$dc.currentRow.response || !this.$dc.currentRow.response.statusCode) {
                return ''
            }
            return `${this.$dc.currentRow.response.statusCode} ${this.$dc.currentRow.response.statusText}`
        },
        contentType() {
            return this.$dc.currentRow.response.contentType
        }
    },
    methods: {
        toggleBodyMode(e) {
            e.stopPropagation();
            this.bodyMode = this.bodyMode === 'parsed' ? 'raw' : 'parsed'
        }
    }
}
</script>

<style scoped>

</style>
