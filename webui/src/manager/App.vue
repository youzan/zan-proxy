<template>
    <div class="main-wrapper">
        <!-- 顶部导航 -->
        <header class="head-nav">
            <span class="dropdown-label">Host 设置：</span>
            <el-dropdown menu-align="start" :hide-on-click="false" @command="selectHostFile">
                <el-button type="text">
                    {{ hostState ? selectedHost.join('，') : '禁用' }}<i class="el-icon-caret-bottom el-icon--right"/>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <!-- host文件 -->
                    <el-dropdown-item
                        v-if="profile.enableHost"
                        command="__disabled__"
                    >
                        禁用
                    </el-dropdown-item>
                    <el-dropdown-item
                        v-if="!profile.enableHost"
                        command="__enabled__"
                    >
                        启用
                    </el-dropdown-item>
                    <el-dropdown-item
                            v-for="hostfile in hostFileList"
                            :command="hostfile.name"
                            :disabled="!profile.enableHost"
                    >
                        {{ hostfile.name }}
                        <i class="el-icon-check" v-if="hostfile.checked"/>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <!-- host开关 -->
            <!-- <span>
                <el-switch
                        :value="profile.enableHost"
                        @input="switchHost"
                        active-text="关闭host"
                        inactive-text="启用host">
                </el-switch>
            </span> -->
            <span class="dropdown-label">请求转发：</span>
            <el-dropdown :hide-on-click="false" menu-align="start" @command="selectRuleFile">
                <el-button type="text">
                    {{ ruleState ? selectedRuleFiles.join('，') : '禁用' }}<i class="el-icon-caret-bottom el-icon--right"/>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <!-- rule文件 -->
                    <el-dropdown-item
                        v-if="profile.enableRule"
                        command="__disabled__"
                    >
                        禁用
                    </el-dropdown-item>
                    <el-dropdown-item
                        v-if="!profile.enableRule"
                        command="__enabled__"
                    >
                        启用
                    </el-dropdown-item>
                    <el-dropdown-item
                            v-for="rulefile in ruleFileList"
                            :command="rulefile.name + '-%-' + rulefile.checked"
                            :disabled="!profile.enableRule"
                    >
                        {{ rulefile.name }}
                        <i class="el-icon-check" v-if="rulefile.checked"/>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <!-- 规则开关 -->
            <!-- <span>
                <el-switch
                        :value="profile.enableRule"
                        @input="switchRule"
                        active-text="关闭rule"
                        inactive-text="启用rule">
                </el-switch>
            </span> -->
        </header>

        <!-- 正文 -->
        <div class="left-fixed-right-auto">
            <div class="left">
                <left-menu/>
            </div>
            <div class="right">
                <div class="main-content">
                    <router-view/>
                </div>
            </div>
        </div>


        <!-- 新增自定义mock数据文件对话框 -->
        <el-dialog title="Mock数据文件" v-model="mockDataFileForm.visible" ref="mockDataDialg" :close-on-click-modal="false">
            <el-form :model="addDataFileForm" label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="mockDataFileForm.name"></el-input>
                </el-form-item>
                <el-form-item label="格式">
                    <el-select v-model="mockDataFileForm.contenttype" placeholder="请选择数据文件格式">
                        <el-option label="html" value="text/html"></el-option>
                        <el-option label="json" value="application/json"></el-option>
                        <el-option label="javascript" value="application/javascript"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div id="content-editor-container" style="height: 305px;">
                <div id="content-editor"></div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="mockDataFileForm.visible = false">取 消</el-button>
                <el-button @click="formatEditor">格式化</el-button>
                <el-button type="primary" @click="saveMockData">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import LeftMenu from './components/common/LeftMenu';
    import hostApi from '../api/host';
    import ruleApi from '../api/rule';
    import confApi from '../api/conf';
    import profileApi from '../api/profile';
    import Vue from 'vue';
    import $ from 'jquery';
    import _ from 'lodash';
    import dataApi from '../api/data';
    import uuidV4 from 'uuid/v4';
    import CodeMirror from 'codemirror';
    import isJSON from 'is-json';
    import 'codemirror/lib/codemirror.css';

    import 'codemirror/addon/display/fullscreen';
    import 'codemirror/addon/display/fullscreen.css';

    import 'codemirror/mode/javascript/javascript';
    import 'codemirror/mode/htmlmixed/htmlmixed';
    let editor = null;
    Vue.component(LeftMenu.name, LeftMenu);
    export default {
        name: 'app',
        data() {
            return {
                isDataCenter: true,
                // 基本配置信息
                configure: {},
                // 个人配置
                profile: {
                    projectPath: [],
                    enableRule: false
                },
                // 将工程路径配置转换为数组格式 方便编辑
                projectPathArray: [],
                // 关联的ip
                mappedClientIps: [],
                // 生效的规则
                rule: [],
                // host文件列表
                hostFileList: [],
                // rule文件列表
                ruleFileList: [],
                filters: [],
                dataList: [],
                // 新增数据文件对话框使用数据
                addDataFileForm: {
                    visible: false,
                    callback: null,
                    id: '',
                    name: '',
                    contenttype: ''
                },
                // 编辑数据文件对话框
                editDataFileForm: {
                    visible: false,
                    entry: {},
                    content: ''
                },
                mockDataFileForm: {
                    isNew: true,
                    visible: false,
                    id: '',
                    name: '',
                    contenttype: '',
                    content: '',
                    callback: null,
                }
            };
        },
        computed: {
            ruleState() {
                return this.profile.enableRule || false;
            },
            hostState() {
                return this.profile.enableHost || false;
            },
            filterState() {
                return this.profile.enableFilter || false;
            },
            selectedHost() {
                return this.hostFileList.filter(h => h.checked).map(h => h.name)
            },
            selectedRuleFiles() {
                return this.ruleFileList.filter(f => f.checked).map(f => f.name)
            }
            
        },
        methods: {
            async switchHost(value){
                if (this.profile.enableHost) {
                    await profileApi.disableHost();
                } else {
                    await profileApi.enableHost();
                }
            },

            async selectHostFile(command) {
                let name = command;
                if (command === '__disabled__') {
                    return await profileApi.disableHost()
                }
                if (command === '__enabled__') {
                    return await profileApi.enableHost()
                }
                hostApi.debouncedUseFile(name, response => {
                    var serverData = response.data;
                    if (serverData.code == 0) {
                        this.$message({
                            type: 'success',
                            message: '设置成功!'
                        });
                    } else {
                        this.$message.error(`出错了,请刷新页面，${serverData.msg}`);
                    }
                });
            },

            async switchFilter(value) {
                if (this.profile.enableFilter) {
                    profileApi.disableFilter();
                } else {
                    profileApi.enableFilter();
                }
            },

            async switchRule(value) {
                if (this.profile.enableRule) {
                    profileApi.disableRule();
                } else {
                    profileApi.enableRule();
                }
            },

            selectRuleFile(command) {
                // panama-false
                if (command === '__disabled__') {
                    return profileApi.disableRule()
                }
                if (command === '__enabled__') {
                    return profileApi.enableRule()
                }
                let kv = command.split('-%-');
                ruleApi.setFileCheckStatus(kv[0], kv[1] == 'false').then(response => {
                    var serverData = response.data;
                    if (serverData.code != 0) {
                        this.$message.error(`出错了，${serverData.msg}`);
                    }
                });
            },

            deleteDataFile(entry, index) {
                this.$confirm(`此操作将永久删除该数据文件: ${entry.name}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.dataList.splice(index, 1);
                    dataApi.saveDataList(this.dataList).then(res => {
                        var serverData = res.data;
                        if (serverData.code == 0) {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message.error(`出错了，${serverData.msg}`);
                        }
                    });
                });
            },

            requestAddDataFile(cb) {
                this.showEditDataFileForm({}, true, cb);
            },

            addDataFile() {
                this.addDataFileForm.visible = false;
                // var id = uuidV4();
                this.dataList.push({
                    id: this.mockDataFileForm.id || uuidV4(),
                    name: this.mockDataFileForm.name,
                    contenttype: this.mockDataFileForm.contenttype
                });
                dataApi.saveDataList(this.dataList).then(res => {
                    var serverData = res.data;
                    if (serverData.code == 0) {
                        this.$message({
                            type: 'success',
                            message: '新建成功!'
                        });
                        this.mockDataFileForm.name = '';
                        this.mockDataFileForm.contenttype = '';
                    } else {
                        this.$message.error(`出错了，${serverData.msg}`);
                    }
                });
            },

            toggleFullScreen() {
                if (editor.getOption('fullScreen')) {
                    // 移除父元素上的transform属性 chrome、firefox transform元素的子元素 fixed属性会变为absolute
                    $('#content-editor')
                        .parents('.el-dialog')
                        .css('transform', '');
                    //   document.getElementById('content-editor-container').appendChild(document.getElementById("content-editor"));
                } else {
                    $('#content-editor')
                        .parents('.el-dialog')
                        .css('transform', 'initial');
                    //   document.body.appendChild(document.getElementById("content-editor"));
                }
                editor.setOption('fullScreen', !editor.getOption('fullScreen'));
                editor.focus();
            },

            closeFullScreen() {
                if (editor.getOption('fullScreen')) {
                    editor.setOption('fullScreen', false);
                    $('#content-editor')
                        .parents('.el-dialog')
                        .css('transform', '');
                    // document.getElementById('content-editor-container').appendChild(document.getElementById("content-editor"));
                    editor.focus();
                }
            },

            formatEditor() {
                // editDataFileForm.entry 可以获得 content的类型
                try {
                    if (!/json/i.test(this.mockDataFileForm.contenttype)) {
                        return;
                    }
                    let content = editor.getValue();
                    let formated = JSON.stringify(JSON.parse(content), null, 4);
                    editor.setValue(formated);
                    editor.refresh();
                    editor.focus();
                } catch (e) {
                    this.$message.error('JSON格式错误，请检查');
                }
            },
            async showEditDataFileForm(entry, isNew, callback) {
                this.mockDataFileForm.isNew = isNew;
                this.mockDataFileForm.id = entry.id || uuidV4();
                this.mockDataFileForm.name = entry.name || '';
                this.mockDataFileForm.contenttype = entry.contenttype || '';
                this.mockDataFileForm.content = '';
                this.mockDataFileForm.callback = callback;
                if (!isNew) {
                    const response = await dataApi.getDataFile(this.mockDataFileForm.id);
                    const serverData = response.data;
                    if (serverData.code != 0) {
                        this.$message.error(`出错了，${serverData.msg}`);
                        return;
                    }
                    this.mockDataFileForm.content = serverData.data;
                }
                this.mockDataFileForm.visible = true;
                if (editor) {
                        editor.setValue(this.mockDataFileForm.content);
                        editor.setOption('mode', this.mockDataFileForm.contenttype);
                        this.$nextTick(() => {
                            editor.refresh();
                            editor.focus();
                        });
                    } else {
                        this.$nextTick(() => {
                            window.$ = $;
                            window.editor = editor = new CodeMirror(
                                document.getElementById('content-editor'),
                                {
                                    value: this.mockDataFileForm.content,
                                    mode: this.mockDataFileForm.contenttype ,
                                    lineNumbers: true,
                                    matchBrackets: true,
                                    autofocus: true,
                                }
                            );
                        });
                    }

            },
            requestEditDataFile(entry, cb) {
                this.showEditDataFileForm(entry, false, cb);
            },
            finishEditDataFile() {
                var entry = this.editDataFileForm.entry;
                if (entry.contenttype.includes('json')) {
                    try {
                        JSON.parse(editor.getValue())
                    } catch (error) {
                        this.$message.error('JSON格式错误，请检查');
                        return;
                    }
                }
                dataApi.saveDataFile(entry.id, editor.getValue()).then(response => {
                    var serverData = response.data;
                    if (serverData.code == 0) {
                        this.$message({
                            type: 'success',
                            message: '保存成功!'
                        });
                        this.editDataFileForm.entry = {};
                        this.editDataFileForm.visible = false;
                        editor.setValue('');
                    } else {
                        this.$message.error(`出错了，${serverData.msg}`);
                    }
                });
        },
        async saveMockData() {
            if (!this.mockDataFileForm.name) {
                this.$message.error('请填写名字');
                return;
            }
            if (!this.mockDataFileForm.contenttype) {
                this.$message.error('请选择格式');
                return;
            }
            if (this.mockDataFileForm.contenttype.includes('json')) {
                    try {
                        JSON.parse(editor.getValue())
                    } catch (error) {
                        this.$message.error('JSON格式错误，请检查');
                        return;
                    }
            }
            if (this.mockDataFileForm.isNew) {
                this.dataList.push({
                    id: this.mockDataFileForm.id,
                    name: this.mockDataFileForm.name,
                    contenttype: this.mockDataFileForm.contenttype,
                })
                await dataApi.saveDataList(this.dataList)
            }
            dataApi.saveDataFile(this.mockDataFileForm.id, editor.getValue()).then(response => {
                    var serverData = response.data;
                    if (serverData.code == 0) {
                        this.$message({
                            type: 'success',
                            message: '保存成功!'
                        });
                        this.mockDataFileForm.callback && this.mockDataFileForm.callback(this.mockDataFileForm.id);
                        this.mockDataFileForm.name = '';
                        this.mockDataFileForm.id = null;
                        this.mockDataFileForm.contenttype = ''
                        this.mockDataFileForm.content = ''
                        this.mockDataFileForm.visible = false;
                        this.mockDataFileForm.callback = null
                        editor.setValue('');
                    } else {
                        this.$message.error(`出错了，${serverData.msg}`);
                    }
                });
        },
    },

        created() {
            if (!window.io) return;
            var socket = io('/manager');

            socket.on('configure', data => {
                this.configure = data;
            });

            socket.on('profile', profile => {
                this.profile = profile;
                let result = [];
                _.forEach(profile.projectPath, (value, key) => {
                    result.push({
                        key,
                        value
                    });
                });
                this.projectPathArray = result;
            });

            socket.on('mappedClientIps', ips => {
                this.mappedClientIps = ips;
            });

            socket.on('hostfilelist', data => {
                this.hostFileList = data;
            });

            socket.on('rulefilelist', data => {
                this.ruleFileList = data;
            });

            socket.on('filters', data => {
                this.filters = data;
            });

            socket.on('datalist', data => {
                this.dataList = data;
            });
        },

        mounted() {
            // 强制dialog渲染body部分, 对ele dialog hack的初始化方式，原始的dialog不提供mouted后的事件
            this.$refs.mockDataDialg.rendered = true;
        },
        
        watch: {
            profile() {
                if (this.profile.enableHost && this.selectedHost) {
                    document.title = `${this.selectedHost} - Zan Proxy`
                } else {
                    document.title = 'Zan Proxy'
                }
            },
            selectedHost() {
                if (this.profile.enableHost && this.selectedHost) {
                    document.title = `${this.selectedHost} - Zan Proxy`
                } else {
                    document.title = 'Zan Proxy'
                }
            },
            'mockDataFileForm.contenttype': function(newValue) {
                if (editor) {
                    editor.setOption('mode', newValue);
                }
            },
        }
    };
</script>

<style scoped>
    .el-dropdown-menu {
        max-height: 500px;
        overflow-y: auto;
    }
    .dropdown-label {
        color: #333333;
        font-size: 14px;
    }
</style>
