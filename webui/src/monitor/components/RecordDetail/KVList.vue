<template>
  <div>
    <kv v-for="(item, index) in list" :k="item[0]" :v="item[1]" :key="index"/>
  </div>
</template>

<script>
import KeyValue from "./KeyValue";

export default {
  name: 'kv-list',

  components: {
    'kv': KeyValue
  },

  props: ['list']
}
</script>
