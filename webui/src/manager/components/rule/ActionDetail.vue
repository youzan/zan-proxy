<template>
    <div style="text-align: left; flex:1;">
        <!-- 动作，空文件 -->
        <div class="inline-block left-panel">
            <!-- 动作类型 -->
            <el-select v-model="action.type" placeholder="请选择"
                       style="margin-right: 10px;font-size: 12px"
                       size="small" :disabled="remote">
                <el-option v-for="item in ruleType" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
        </div>
        <!-- 参数设置- 请求转发 -->
        <div v-if="action.type == 'redirect'" class="inline-block right-panel">
            <div class="action-data">
                <el-input v-model="action.data.target" size="small" :disabled="remote"
                          placeholder="远程地址(以http/https开头)、本地地址">
                </el-input>
            </div>
        </div>
        <!-- 参数设置- 返回自定义数据 el-select的一个bug，当el-select从界面中消失的时候会解绑事件。。所以用v-show -->
        <div v-show="action.type == 'mockData'" class="inline-block right-panel">
            <div class="action-data">
              <span>
                <el-select v-model="action.data.dataId"
                           style="width: 300px" size="small" filterable placeholder="请选择要返回的数据">
                  <el-option
                          v-for="dataentry in $dc.dataList"
                          :label="dataentry.name" :key="dataentry.id"
                          :value="dataentry.id">
                  </el-option>
                </el-select>
              </span>
              <span v-if="datafileEntry" style="margin-left: 10px;">
                <el-button type="text" @click="editDataFile(datafileEntry)">
                  编辑数据
                </el-button>
              </span>
              <span style="margin-left: 10px;">
                <el-button type="text" @click="addDataFile">增加自定义数据</el-button>
              </span>
            </div>
        </div>
        <!-- 设置cookie -->
        <div v-if="action.type == 'addRequestCookie'" class="inline-block right-panel">
            <div class="action-data">
                <el-input v-model="action.data.cookieKey" size="small" :disabled="remote"
                          placeholder="cookie key" style="display: inline-block;width: 120px;">
                </el-input>
                <el-input v-model="action.data.cookieValue" size="small" :disabled="remote"
                          placeholder="cookie value" style="display: inline-block;width: 300px;">
                </el-input>
            </div>
        </div>
        <!-- 修改返回内容 -->
        <div v-if="action.type == 'modifyResponse'" class="inline-block right-panel">
            <div class="action-data">
                <el-select v-model="action.data.modifyResponseType" style="width: 260px"
                           size="small" placeholder="请选择修改返回body操作" :disabled="remote">
                    <el-option v-for="item in modifyResponseType" :key="item.value" :label="item.label"
                               :value="item.value">
                    </el-option>
                </el-select>
                <span v-if="action.data.modifyResponseType == 'returnDataInJsonpStyle'">
                  <el-input v-model="action.data.callbackName" size="small" :disabled="remote" style="width:200px;"
                            placeholder="jsonp callback参数名">
                  </el-input>
                </span>
            </div>
        </div>
        <!-- 增加请求头 -->
        <div v-if="action.type == 'addRequestHeader'" class="inline-block right-panel">
            <div class="action-data">
                <el-input v-model="action.data.headerKey" size="small" :disabled="remote"
                          placeholder="header key" style="display: inline-block;width: 120px;">
                </el-input>
                <el-input v-model="action.data.headerValue" size="small" :disabled="remote"
                          placeholder="header value" style="display: inline-block;width: 120px;">
                </el-input>
            </div>
        </div>
        <!-- 增加响应头 -->
        <div v-if="action.type == 'addResponseHeader'" class="inline-block right-panel">
            <div class="action-data">
                <el-input v-model="action.data.headerKey" size="small" :disabled="remote"
                          placeholder="header key" style="display: inline-block;width: 120px;">
                </el-input>
                <el-input v-model="action.data.headerValue" size="small" :disabled="remote"
                          placeholder="header value" style="display: inline-block;width: 120px;">
                </el-input>
            </div>
        </div>
        <!-- 脚本修改请求 -->
        <div v-if="action.type == 'scriptModifyRequest'" class="inline-block right-panel">
            <textarea style="width: 500px;height: 90px" v-model="action.data.modifyRequestScript">
            </textarea>
        </div>
        <!-- 脚本修改响应 -->
        <div v-if="action.type == 'scriptModifyResponse'" class="inline-block right-panel">
            <textarea  style="width: 500px;height: 90px" v-model="action.data.modifyResponseScript">
            </textarea>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    export default {
        name: 'action-detail',
        props: ['action', 'remote'],
        data() {
            return {
                ruleType: [
                    { value: 'redirect', label: '转发请求' },
                    { value: 'mockData', label: '返回自定义数据' },
                    { value: 'addRequestHeader', label: '增加请求头' },
                    { value: 'addResponseHeader', label: '增加响应头' },
                    // { value: 'modifyResponse', label: '修改响应内容' },
                    // { value: 'addRequestCookie', label: '设置请求cookie' },
                    // { value: 'scriptModifyRequest', label: 'js修改请求内容' },
                    // { value: 'scriptModifyResponse', label: 'js修改响应内容' }
                    { value: 'empty', label: '返回空文件' }
                ],
                modifyResponseType: [
                    { value: 'addTimestampToJsCss', label: '将html中的js、css请求加上时间戳' },
                    { value: 'returnDataInJsonpStyle', label: '以JSONP的方式返回数据' },
                    { value: 'allowCros', label: '增加跨域头部' },
                    { value: 'return404', label: '返回404' }
                ]
            };
        },
        methods: {
            addDataFile(){
                // 新建数据文件，并将当前规则返回的自定义数据文件设为新建的文件
                this.$dc.requestAddDataFile((id) => {
                    this.action.data.dataId = id;
                });
            },
            editDataFile(entry){
                this.$dc.requestEditDataFile(entry);
            }
        },
        computed: {
            datafileEntry(){
                if (this.action.type == "mockData") {
                    var finded = _.find(this.$dc.dataList, (entry) => {
                        return entry.id == this.action.data.dataId;
                    });
                    if (!finded) this.action.data.dataId = '';
                    return finded;
                }
            }
        }
    };

</script>
<style scoped>
    .inline-block {
        display: inline-block;
    }

    .conditon {
        margin-top: 10px;
    }

    .conditon:after {
        content: "";
        display: block;
        border-bottom: 1px dotted #adadad;
    }

    .action {
        margin-bottom: 10px;
    }

    .left-panel {
        width: 160px;
        vertical-align: top;
    }

    .right-panel {
        width: calc(100% - 170px);
        padding-left: 10px;
    }

    .action-data {
        text-align: left;
    }

    .action-option {
        margin-top: 5px;
    }
</style>
