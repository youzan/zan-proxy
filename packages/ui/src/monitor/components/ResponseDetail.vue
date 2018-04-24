<template>
    <div class="response">
        <div class="response__header">
            <div class="response__tab" :class="{'active':activeName == 'Header'}" @click="tabClick('Header')">Header</div>
            <div class="response__tab" :class="{'active':activeName == 'Set Cookies'}" @click="tabClick('Set Cookies')">Set Cookies</div>
            <div class="response__tab" :class="{'active':activeName == 'Body'}" @click="tabClick('Body')">Body</div>
        </div>
        <div class="response__body">
            <div v-if="activeName == 'Header'">
                <key-value-list :data="$dc.responseHeader"></key-value-list>
            </div>
            <div class="set-cookies" v-if="activeName == 'Set Cookies'">
                <div class="cookie-row" v-for="row in $dc.setCookies">
                    {{row}}
                </div>
            </div>
            <div v-if="activeName == 'Body'" class="text-area">{{$dc.currentResponseBody}}</div>
        </div>
    </div>
</template>

<script>
    import KeyValueList from './KeyValueList.vue';
    import './responsedetail.pcss'
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
