<template>
    <div class="traffic">
        <!-- 头部 -->
        <div class="header row">
            <div class="cell cell-index">#</div>
            <div class="cell cell-status">Status</div>
            <div class="cell cell-method">Method</div>
            <div class="cell cell-protocol">Protocol</div>
            <div class="cell cell-host">Host</div>
            <div class="cell cell-path">Path</div>
            <div class="cell cell-type">Type</div>
            <div class="cell cell-time">Time</div>
        </div>
        <!-- 列表区域 优化后的列表展示组件，只展示显示区域 -->
        <list :total="$dc.total"
              :height="height - 28"
              :rowHeight="24">
            <template scope="props">
                <record v-for="index in props.ids" :index="index" :id="$dc.filterdRecordArray[index]" :key="index"
                        @right-clicked="rightClicked"></record>
            </template>
        </list>
        <context-menu id="testingctx" ref="ctx"
                      :ctxOpen="onCtxOpen"
                      :ctxCancel="resetCtxLocals"
                      :ctxClose="onCtxClose">
            <li class="ctx-item" @click="saveData">保存为mock数据</li>
            <li class="ctx-item" @click="copyUrl">复制url</li>
        </context-menu>
    </div>
</template>
<script>
    import _ from 'lodash';
    import List from './List.vue';
    import copyToClipboard from 'copy-to-clipboard';
    import ContextMenu from '../../context-menu';
    import dataApi from '../../api/data';
    import './httptraffic.pcss';
    import Record from './record.vue';
    export default {
        props: ['height'],
        components: { List, ContextMenu, Record },
        data(){
            return {};
        },
        methods: {
            // -------------------------------菜单操作
            saveData(){
                if (!this.$dc.rightClickRow.response) {
                    this.$message({
                        message: '服务器还没有响应',
                        type: 'warning'
                    });
                    return;
                }
                this.$prompt('请输入数据文件名', '保存为数据文件', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({ value }) => {
                    dataApi.saveDataEntryFromTraffic(this.$dc.rightClickId, value
                        , this.$dc.rightClickRow.response.headers['content-type'].split(';')[0]).then((res) => {
                        var serverData = res.data;
                        if (serverData.code == 0) {
                            this.$message({
                                type: 'success',
                                message: '保存成功!'
                            });
                        } else {
                            this.$message.error(`出错了，${serverData.msg}`);
                        }
                    });
                });
            },
            // 复制url
            copyUrl(){
                let request = this.$dc.rightClickRow.originRequest;
                const { protocol, host, port, path } = request;
                let url = `${protocol}//${host}`;
                if (port) {
                    url += `:${port}`;
                }
                url += path;
                // copyToClipboard(`${requset.protocol}//${requset.host}:${requset.port}${requset.path}`);
                copyToClipboard(url)
                this.$message('已将url复制到剪切板');
            },

            // -------------------------------右击菜单显示
            // 打开菜单
            onCtxOpen(recordId) {
                this.$dc.setRightClickedRecordId(recordId);
            },
            rightClicked(event,recordId){
                this.$refs.ctx.open(event, recordId)
            },
            // 点击菜单选项
            onCtxClose(locals) {
            },
            // 点击空白地方
            resetCtxLocals() {
                this.$dc.setRightClickedRecordId('');
            }
        }
    };
</script>