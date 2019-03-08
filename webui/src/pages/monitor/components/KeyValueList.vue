<template>
  <div class="keyvalue-wrapper">
    <template v-for="(value, index) in data">
      <div class="row" :key="index">
        <div class="name">{{ key }}</div>
        <div class="value">{{ value }}</div>
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
