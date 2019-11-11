<template>
  <div class="kv-pair">
    <label>{{ k }}:</label>
    <span>
      {{ v }}
      <slot></slot>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Vue from 'vue';

@Component
export default class KeyValue extends Vue {
  @Prop(String)
  k: string;

  @Prop(String)
  v: string;
}
</script>

<style lang="scss" scoped>
.kv-pair {
  overflow-x: auto;
  word-break: break-all;
}
.kv-pair label {
  font-weight: bolder;
  margin-right: 5px;
}
</style>
