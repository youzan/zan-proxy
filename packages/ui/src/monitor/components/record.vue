<template>
    <div @click="clickRow(id)"
         :class="{'selected': $dc.selectId == id, 'right-clicked':$dc.rightClickId == id}"
         @contextmenu.prevent="rightClicked($event, id)"
         class="record row">
        <div class="cell cell-index">{{index+1}}</div>
        <div class="cell cell-status">{{status}}</div>
        <div class="cell cell-method">{{method}}</div>
        <div class="cell cell-protocol">{{protocol}}</div>
        <div class="cell cell-host">{{host}}</div>
        <div class="cell cell-path">{{path}}</div>
        <div class="cell cell-type">{{type}}</div>
        <div class="cell cell-time">{{duration}}</div>
    </div>
</template>

<script>
    export default {
        props: ['index', 'id'],
        computed: {
            row(){
                let curRow = this.$dc.recordMap[this.id];
                // 状态码
                // 请求类型
                // 请求耗时

                return curRow;
            },
            status(){
                try {
                    return this.row.response.statusCode;
                } catch (e) {
                    return '';
                }
            },
            method(){
                return this.row.originRequest.method;
            },
            protocol(){
                return this.row.originRequest.protocol;
            },
            host(){
                return this.row.originRequest.host;
            },
            path(){
                return this.row.originRequest.path;
            },
            type(){
                try {
                    return this.row.response.headers['content-type'];
                } catch (e) {
                    return '';
                }
            },
            duration(){
                try {
                    return this.row.response.remoteResponseEndTime -
                        this.row.response.remoteRequestBeginTime;
                } catch (e) {
                    return '';
                }
            }
        },
        methods: {
            // 点击行
            clickRow(id){
                this.$dc.setCurrentRowIndex(id);
            },

            rightClicked(event, recordId){
                this.$emit('right-clicked', event, recordId);
            }

        }
    };
</script>