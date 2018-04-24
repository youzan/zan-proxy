<template>
  <div class="keyvalue-wrapper">
    <template v-for="value,key in data">
      <div class="row">
        <div class="name">{{key}}</div>
        <div class="value">{{value}}</div>
      </div>
    </template>
  </div>
</template>

<script>
  import './keyvaluelist.pcss'
  export default {
    props: ["data"]
  }
</script>

