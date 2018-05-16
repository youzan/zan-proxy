<template>
  <div class="record-detail" :class="{show: $dc.hasCurrent}">
    <span class="close-button" @click="$emit('close')">
        <i class="el-icon-close"></i>
    </span>
    <el-tabs v-model="activeName" type="border-card" v-if="$dc.hasCurrent">
        <el-tab-pane label="Request" name="Request">
            <request></request>
        </el-tab-pane>
        <el-tab-pane label="Response" name="Response">
            <response></response>
        </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Request from './Request'
import Response from './Response'
export default {
  components: {
      'request': Request,
      'response': Response
  },
  data() {
      return {
          activeName: 'Request'
      }
  }
}
</script>

<style>
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
    }
    .record-detail.show {
        left: calc(100% - 600px);
    }
    .record-detail .close-button {
        position: absolute;
        top: 10px;
        right: 30px;
        z-index: 10;
        cursor: pointer;
        color: rgb(115, 115, 115);
    }
    .toggle-mode-button {
        float: right;
        color: #ccc;
        font-size: 12px;
        cursor: pointer;
        margin-right: 15px;
    }
</style>
