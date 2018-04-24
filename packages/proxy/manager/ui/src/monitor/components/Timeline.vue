<template>
    <div>
        <key-value-list :data="$dc.timeline"></key-value-list>
    </div>
</template>

<script>
    import KeyValueList from './KeyValueList.vue';
    export default {
        components: { KeyValueList },
    }
</script>