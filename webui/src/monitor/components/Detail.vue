<template>
    <div class="detail" :style="{'height': height + 'px'}">
        <div class="detail__header">
            <div class="detail__tab" :class="{'active':activeName == 'Origin'}" @click="tabClick('Origin')">原始请求</div>
            <div class="detail__tab" :class="{'active':activeName == 'Request'}" @click="tabClick('Request')">Request</div>
            <div class="detail__tab" :class="{'active':activeName == 'Response'}" @click="tabClick('Response')">Response</div>
            <div class="detail__tab" :class="{'active':activeName == 'Timeline'}" @click="tabClick('Timeline')">Timeline</div>
        </div>
        <div class="detail__body">
            <div v-if="activeName == 'Origin'">
                <origin></origin>
            </div>
            <div v-if="activeName == 'Request'">
                <request-detail></request-detail>
            </div>
            <div v-if="activeName == 'Response'">
                <response-detail></response-detail>
            </div>
        </div>
    </div>
</template>

<script>
    import RequestDetail from './RequestDetail.vue';
    import ResponseDetail from './ResponseDetail.vue';
    import Origin from './Origin.vue';
    import Timeline from './Timeline.vue';
    import './detail.pcss';
    export default {
        props: ['height'],
        components: {
            RequestDetail, ResponseDetail, Origin, Timeline
        },
        data(){
            return {
                activeName: 'Origin'
            };
        },
        methods: {
            tabClick(tab){
                this.activeName = tab;
            }
        }
    };
</script>
