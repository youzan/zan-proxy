<template>
  <div class="list">
    <div class="header">
      <div>#</div>
      <div>Status</div>
      <div>Method</div>
      <div>Protocol</div>
      <div>Host</div>
      <div>Path</div>
      <div>Type</div>
      <div>Time</div>
    </div>
    <VirtualScroller class="scroller" :items="[]" :item-height="24" content-tag="table">
      <template slot-scope="props">
        <tr class="letter" :key="props.itemKey">
          <td>
            {{props.item.value}} Scoped
          </td>
        </tr>
      </template>
    </VirtualScroller>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import VirtualScroller from 'vue-virtual-scroller'

export default {
  components: {
    VirtualScroller
  },
  computed: {
    ...mapState({
      list: 'list'
    })
  }
}
</script>

<style scoped>
.list {
  grid-area: list;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-around;
}
</style>

