<template>
    <div>
        <kv v-for="(value, key) in obj" :k="key" :v="value" :key="key"></kv>
    </div>
</template>

<script>

import KeyValue from "./KeyValue";
export default {
  components: {
      'kv': KeyValue
  }, 
  props: ['obj'],
}
</script>


