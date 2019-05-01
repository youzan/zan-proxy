<template>
  <el-collapse-item title="Body" name="body" v-if="body" v-loading="loading">
    <template slot="title">
      Body
      <el-link v-if="bodyIsJson" class="mode-toggle" @click="toggleBodyMode">
        {{ bodyMode === 'parsed' ? 'View Source' : 'View Parsed' }}
      </el-link>
    </template>
    <json-tree v-if="bodyIsJson && bodyMode === 'parsed'" :data="JSON.parse(body)" />
    <div v-else>{{ body }}</div>
  </el-collapse-item>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
// @ts-ignore
import JsonTree from 'vue-json-tree';
import Vue from 'vue';

type IBodyMode = 'parsed' | 'source';

@Component({
  components: {
    JsonTree,
  },
})
export default class BodyCollapseItem extends Vue {
  bodyMode: IBodyMode = 'parsed';

  @Prop(String)
  body: string;

  @Prop(Boolean)
  loading: boolean;

  @Prop({
    type: String,
    default: '',
  })
  contentType: string;

  get bodyIsJson() {
    if (this.contentType) {
      return this.contentType.includes('application/json');
    }
    try {
      JSON.parse(JSON.parse(this.body));
      return true;
    } catch {
      return false;
    }
  }

  toggleBodyMode(e: MouseEvent) {
    e.stopPropagation();
    this.bodyMode = this.bodyMode === 'parsed' ? 'source' : 'parsed';
  }
}
</script>

<style lang="scss" scoped>
.mode-toggle {
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  line-height: 100%;
  margin-left: 15px;
}
</style>
