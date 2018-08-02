<template>
  <div class="kv-pair">
      <label>{{ k }}: </label>
      <span>{{ v }}<slot></slot></span>
  </div>
</template>

<script>
export default {
    props: ['k', 'v']
}
</script>

<style scoped>
    .kv-pair {
        overflow-x: auto;
        word-break: break-all;
    }
    .kv-pair label {
        font-weight: bolder;
        margin-right: 5px;
    }
</style>
