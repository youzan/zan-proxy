<template>
    <div>
        <div class="main-content__title">过滤器</div>
        <el-row :gutter="20" style="margin-bottom: 10px;text-align: right;">
            <el-col :span="6" :offset="18">
                <el-button size="small" @click='addRule'>新增过滤器</el-button>
                <el-button size="small" type="primary" @click='saveFileRightNow'>保存过滤器</el-button>
            </el-col>
        </el-row>
        <el-table border style="width: 100%" row-key="key" :stripe="true" align='center' :data="$dc.filters">
            <el-table-column prop="checked" label="启用" align="center" width="80">
                <template scope='scope'>
                    <el-tooltip class="item" effect="dark" content="勾选后启动这条规则" placement="left">
                        <el-checkbox v-model="scope.row.checked" :disabled="!$dc.filterState"></el-checkbox>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="规则设置" align="center">
                <template scope='scope'>
                    <rule-filter-detail :rule="scope.row" ></rule-filter-detail>
                </template>
            </el-table-column>
            <el-table-column label="操作" :width="100" align="center" :context="_self">
                <template scope='scope'>
                    <div>
                        <el-tooltip class="item" effect="dark" content="复制" placement="left">
                            <el-button icon='document' size="mini"
                                       @click='onDuplicateRow(scope.row,scope.$index)'>
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="删除" placement="top">
                            <el-button type="danger" icon='delete' size="mini"
                                       @click='onDeleteRow(scope.row,scope.$index)'>
                            </el-button>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import filtersApi from '../../../api/filter';
    import _ from 'lodash';
    import uuidV4  from 'uuid/v4';
    import RuleDetail from './RuleDetail';
    import Vue from 'vue';
    Vue.component(RuleDetail.name, RuleDetail);

    export default {
        name: 'filters',
        methods: {
            onDeleteRow(row, index, list) {
                this.$confirm('此操作不可恢复, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$dc.filters.splice(index, 1);
                });
            },
            onDuplicateRow(row, index, list) {
                var copy = _.cloneDeep(this.$dc.filters[index]);
                this.$dc.filters.splice(index, 0, copy);
            },
            /**
             * 立刻保存
             */
            async saveFileRightNow(){
                debugger
               let result = await filtersApi.saveFilters(this.$dc.filters);
                if (result.code == 0) {
                    this.$message({
                        type: 'success',
                        message: '保存成功!'
                    });
                }
            },
            addRule() {
                this.$dc.filters.unshift({
                    name: "",
                    key: uuidV4(),
                    method: "",
                    match: "",
                    checked: true,
                    actionList: [{
                        type: "addRequestHeader",// 转发redirect  接口转发api 使用数据文件替换data
                        data: {
                            target: "",// 转发目标路径
                            dataId: '', //返回数据文件的id
                            modifyResponseType: '',// 修改响应内容类型
                            callbackName: "", // jsonp请求参数名
                            cookieKey: "", // 设置到请求里的cookie key
                            cookieValue: "", // 设置到请求里的cookie value
                            headerKey: "",
                            headerValue: "",
                            modifyRequestScript: "",
                            modifyResponseScript: ""
                        }
                    }]
                });
            },
        }
    };

</script>
