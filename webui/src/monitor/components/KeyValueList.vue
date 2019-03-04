<template>
  <div class="keyvalue-wrapper">
    <template v-for="(value,key) in data">
      <div class="row" :key="key">
        <div class="name">{{key}}</div>
        <div class="value">{{value}}</div>
      </div>
    </template>
  </div>
</template>

<script>
import './keyvaluelist.scss';
export default {
  props: ['data'],
};
</script>

