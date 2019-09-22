<template>
  <el-tooltip
    class="meta-tag-tooltip"
    effect="dark"
    :content="isRemote ? remoteTooltip : localTooltip"
    placement="right"
  >
    <span class="meta-tag" :class="{ remote: isRemote }">{{ isRemote ? remoteTag : localTag }}</span>
  </el-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class MetaTag extends Vue {
  @Prop({
    type: Boolean,
  })
  isRemote: boolean;

  @Prop({
    type: String,
  })
  remoteTooltip: string;

  @Prop({
    type: String,
    default: 'R',
  })
  remoteTag: string;

  @Prop({
    type: String,
  })
  localTooltip: string;

  @Prop({
    type: String,
    default: 'L',
  })
  localTag: string;
}
</script>

<style lang="scss" scoped>
.meta-tag {
  background-color: rgb(191, 203, 217);
  color: #fff;
  font-size: 10px;
  display: inline-block;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  line-height: 16px;
  margin-left: 2px;
  text-align: center;
  opacity: 0.5;

  &.remote {
    background-color: #58b7ff;
  }
}
</style>
