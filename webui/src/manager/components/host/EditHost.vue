<template>
    <div>
        <div class="main-content__title">编辑Host文件{{ loaded ? ': ' + filecontent.name : '' }}</div>
        <el-row :gutter="20" style="margin-bottom: 10px">
            <el-col :span="6" :offset="18">
                <el-button size="small" @click='addRow'>新增Host Entry</el-button>
                <el-button size="small" type="primary" @click='saveFile'>保存文件</el-button>
            </el-col>
        </el-row>
        <el-table border style="width: 100%" align='center' :data="hostarray">
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="key" label="域名" align="center">
                <template scope='scope'>
                    <el-input v-model="scope.row.key" size="small" placeholder="请输入内容"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="value" label="ip地址" align="center" width="400">
                <template scope='scope'>
                    <el-input v-model="scope.row.value" size="small" placeholder="请输入内容"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="操作" :width="80" align="center" :context="_self">
                <template scope='scope'>
                    <el-button type="danger" icon='delete' size="mini"
                               @click='onDeleteRow(scope.row,scope.$index,filecontent.content)'>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import hostApi from '../../../api/host';
    import forEach from 'lodash/forEach';
    export default {
        name: 'app',
        data() {
            return {
                loaded: false,
                filecontent: {},
                hostarray: []
            }
        },
        methods: {
            getFile() {
                this.loaded = false;
                hostApi.getFileContent(this.$route.query.name).then((response) => {
                    var serverData = response.data;
                    if (serverData.code == 0) {
                        this.loaded = true;
                        this.filecontent = serverData.data;
                        // 解析host数组
                        this.hostarray = [];
                        forEach(this.filecontent.content, (value, key) => {
                            this.hostarray.push({
                                key: key,
                                value: value
                            })
                        });
                    } else {
                        this.$message.error(`出错了，${serverData.msg}`);
                    }
                });
            },
            onDeleteRow(row, index, list) {
                this.$confirm('此操作不可恢复, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.hostarray.splice(index, 1);
                })
            },
            saveFile() {
                // 由host数组组装文件
                var content = {};
                forEach(this.hostarray, (obj) => {
                    content[obj.key] = obj.value;
                });
                this.filecontent.content = content;

                hostApi.saveFile(this.$route.query.name, this.filecontent).then((response) => {
                    var serverData = response.data;
                    if (serverData.code == 0) {
                        this.$message({
                            type: 'success',
                            message: '保存成功!'
                        });
                    } else {
                        this.$message.error(`出错了，${serverData.msg}`);
                    }
                });
            },
            addRow() {
                this.hostarray.unshift({
                    key: "",
                    value: ""
                })
            }
        },
        mounted() {
            this.getFile();
        },
        watch: {
            '$route'(to, from) {
                this.getFile();
            }
        }
    }

</script>
