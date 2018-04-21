<template>
    <div style="text-align: left">
        <!-- 条件，说明 -->
        <div class="el-form demo-form-inline el-form--inline conditon">
            <div class="el-form-item" style="margin-bottom:8px;">
                <!-- <label class="el-form-item__label">条件</label> -->
                <div class="el-form-item__content">
                    <el-select v-model="rule.method" style="width: 100px;" size="small" placeholder="请选择"
                               :disabled="remote">
                        <el-option v-for="item in methodlist" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="el-form-item"
                 style="margin-bottom:8px;width: calc(100% - 170px);padding-left: 20px;margin-right: 0px">
                <div class="el-form-item__content" style="width: 100%">
                    <el-input v-model="rule.match" style="width: 100%" size="small" :disabled="remote"
                              placeholder="填写要拦截的url中部分连续的字符串，或者匹配要拦截url的正则表达式"></el-input>
                </div>
            </div>
        </div>
        <div style="padding: 10px 0;">
      <span style="width: 85%;display: inline-block">
        <div>
          <el-input v-model="rule.name" size="small" placeholder="规则说明，写一段文字，方便记忆这个规则的作用"></el-input>
        </div>
      </span>
            <span style="width: 10%;display: inline-block">
        <el-button type="text" @click="addAction" :disabled="remote">新增动作</el-button>
      </span>
        </div>
        <div>
            <div v-for="action,index in rule.actionList" :key="index" class="dashed-border">
        <span style="width: 85%;display: inline-block">
          <action-detail :action="action"
                         :remote="remote"></action-detail>
        </span>
                <span style="width: 10%;display: inline-block;vertical-align: bottom;line-height: 107px;height: 107px;">
          <el-button type="text" :disabled="remote" @click="deleteAction(index)">删除动作</el-button>
        </span>
            </div>

        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import Vue from 'vue';
    import ActionDetail from './ActionDetail.vue';
    Vue.component(ActionDetail.name, ActionDetail);
    export default {
        name: 'rule-detail',
        props: ['rule', 'remote'],
        data() {
            return {
                methodlist: [
                    { value: '', label: '所有' },
                    { value: 'get', label: 'GET' },
                    { value: 'post', label: 'POST' },
                    { value: 'put', label: 'PUT' },
                    { value: 'patch', label: 'PATCH' },
                    { value: 'delete', label: 'DELETE' }
                ]
            };
        },
        methods: {

            editDataFile(entry){
                this.$dc.requestEditDataFile(entry);
            },
            addAction(){
                this.rule.actionList.push({
                    type: "redirect",// 转发redirect
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
                });
            },
            deleteAction(index){
                this.rule.actionList.splice(index, 1);
            }
        }
    };

</script>
<style>
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
</style>
