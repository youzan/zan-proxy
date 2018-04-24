<template>    
  <div class="operation">
    <span class="icon-btn" @click="requestToggleRecordState">
      <!-- <i class="iconfont icon-zanting" v-if="!state.stopRecord"></i> -->
      <!-- <i class="iconfont icon-bofang" v-else></i> -->
    </span>
    <i class="iconfont icon-qingchu icon-btn" @click="requestClear"></i>
      <!-- <span class="tips " :style="{visibility: state.overflow? 'initial' : 'hidden'}">记录已满，请清除历史记录</span> -->
    <div class="filters">
      <label>Filter:</label>
      <el-input class="input" placeholder="Search" v-model="keyword" />
      <i class="iconfont icon-sousuo search"></i>
    </div>
  </div>
</template>

<script>
import {  } from 'vuex'

export default {
  computed: {
    keyword: {
      get() {
        return this.$store.state.keyword
      },
      set(value) {
        this.$store.commit('keywordChange', value)
      }
    }
  },
  methods: {
    requestToggleRecordState() {
      
    },
    requestClear() {
      
    }
  }
}
</script>

<style scoped>
.operation {
  grid-area: operation;
  display: flex;
  align-items: center;
}
.filters {
  display: flex;
  align-items: center;
}
.filters > * {
  padding: 0 5px;
}
.input :global(.el-input__inner) {
  height: 24px;
  border-radius: 0;
}
</style>

