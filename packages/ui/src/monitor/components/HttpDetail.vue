<template>
  <el-collapse v-model="active">
    <el-collapse-item title="Headers" name="1">
      <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
    </el-collapse-item>
    <el-collapse-item title="Cookie" name="2">
      Cookie
    </el-collapse-item>
    <el-collapse-item title="Query" name="3">
      <div>简化流程：设计简洁直观的操作流程；</div>
    </el-collapse-item>
    <el-collapse-item title="Body" name="4">
      <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {
  data() {
    return {
      active: ['1', '2', '3', '4']
    }
  }
}
</script>

<style scoped>

</style>

