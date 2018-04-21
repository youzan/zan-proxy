<template>
  <div class="kv-pair">
      <label>{{ k }}: </label>
      <span>{{ v }}</span>
  </div>
</template>

<script>
export default {
    props: ['k', 'v']
}
</script>

<style scoped>
    .kv-pair label {
        font-weight: bolder;
        margin-right: 5px;
    }
</style>
