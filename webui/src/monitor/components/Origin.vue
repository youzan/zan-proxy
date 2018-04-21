<template>
    <div class="origin">
        <div class="request__header">
            <div class="request__tab" :class="{'active':activeName == 'Header'}" @click="tabClick('Header')">Header</div>
            <div class="request__tab" :class="{'active':activeName == 'Cookie'}" @click="tabClick('Cookie')">Cookie</div>
            <div class="request__tab" :class="{'active':activeName == 'Query Params'}" @click="tabClick('Query Params')">Query Params</div>
        </div>
        <div class="request__body">
            <div v-if="activeName == 'Header'">
                <key-value-list :data="$dc.originRequestHeader"></key-value-list>
            </div>
            <div v-if="activeName == 'Cookie'">
                <key-value-list :data="$dc.originRequestCookie"></key-value-list>
            </div>
            <div v-if="activeName == 'Query Params'">
                <key-value-list :data="$dc.originRequestQueryParams"></key-value-list>
            </div>
        </div>
    </div>
</template>

<script>
    import './origin.pcss';
    import KeyValueList from './KeyValueList.vue';
    export default {
        components: { KeyValueList },
        data(){
            return {
                activeName: 'Header'
            };
        },
        methods: {
            tabClick(tab){
                this.activeName = tab;
            }
        }
    };
</script>