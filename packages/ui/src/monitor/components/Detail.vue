<template>
  <el-tabs class="detail" type="border-card">
    <el-tab-pane label="原始请求">
      <HttpDetail />
    </el-tab-pane>
    <el-tab-pane label="配置管理">配置管理</el-tab-pane>
    <el-tab-pane label="角色管理">角色管理</el-tab-pane>
    <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
  </el-tabs>
        <!-- <div class="detail__header">
            <div class="detail__tab" :class="{'active':activeName == 'Origin'}" @click="tabClick('Origin')">原始请求</div>
            <div class="detail__tab" :class="{'active':activeName == 'Request'}" @click="tabClick('Request')">Request</div>
            <div class="detail__tab" :class="{'active':activeName == 'Response'}" @click="tabClick('Response')">Response</div>
            <div class="detail__tab" :class="{'active':activeName == 'Timeline'}" @click="tabClick('Timeline')">Timeline</div>
        </div>
        <div class="detail__body">
            <div v-if="activeName == 'Origin'">
                <origin></origin>
            </div>
            <div v-if="activeName == 'Request'">
                <request-detail></request-detail>
            </div>
            <div v-if="activeName == 'Response'">
                <response-detail></response-detail>
            </div>
            <div v-if="activeName == 'Timeline'">
                <timeline></timeline>
            </div>
        </div> -->
</template>

<script>
import HttpDetail from './HttpDetail'
// import RequestDetail from './RequestDetail.vue';
// import ResponseDetail from './ResponseDetail.vue';
// import Origin from './Origin.vue';
// import Timeline from './Timeline.vue';
// import './detail.pcss';
export default {
  components: {
    HttpDetail
  }
}
</script>

<style scoped>
.detail {
  grid-area: detail;
}
</style>

