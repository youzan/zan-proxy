<template>
    <div class="request">
        <div class="request__header">
            <div class="request__tab" :class="{'active':activeName == 'Header'}" @click="tabClick('Header')">Header</div>
            <div class="request__tab" :class="{'active':activeName == 'Cookie'}" @click="tabClick('Cookie')">Cookie</div>
            <div class="request__tab" :class="{'active':activeName == 'Query Params'}" @click="tabClick('Query Params')">Query Params</div>
            <div class="request__tab" :class="{'active':activeName == 'Body'}" @click="tabClick('Body')">Body</div>
        </div>
        <div class="request__body">
            <div v-if="activeName == 'Header'">
                <key-value-list :data="$dc.requestHeader"></key-value-list>
            </div>
            <div v-if="activeName == 'Cookie'">
                <key-value-list :data="$dc.requestCookie"></key-value-list>
            </div>
            <div v-if="activeName == 'Query Params'">
                <key-value-list :data="$dc.requestQueryParams"></key-value-list>
            </div>
            <div v-if="activeName == 'Body'" class="text-area">{{$dc.currentRequestBody}}</div>
        </div>
    </div>
</template>

<script>
    import KeyValueList from './KeyValueList.vue';
    import './requestdetail.pcss';
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
