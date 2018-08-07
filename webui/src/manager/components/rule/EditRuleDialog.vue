<template>
    <el-dialog title="编写规则" :visible.sync="dialogVisible" @close="cancel">
        <el-form :model="rule">
            <el-form-item label="请求方法" :label-width="formLabelWidth">
                <el-select v-model="rule.method" placeholder="请选择">
                    <el-option v-for="item in methodlist" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="URL特征" :label-width="formLabelWidth">
               <el-input v-model.trim="rule.match" auto-complete="off" placeholder="填写要拦截的url中部分连续的字符串，或者匹配要拦截url的正则表达式"></el-input>
            </el-form-item>
            <el-form-item label="规则描述" :label-width="formLabelWidth">
               <el-input v-model="rule.name" auto-complete="off" placeholder="规则说明，写一段文字，方便记忆这个规则的作用"></el-input>
            </el-form-item>
            <el-form-item label="请求动作" :label-width="formLabelWidth">
                <div class="action-container" v-for="(action, index) in rule.actionList" :key="index">
                    <action-detail :action="action" />
                    <el-tooltip class="item" effect="dark" content="删除" placement="right">
                         <el-button type="danger" icon='minus' size="mini" @click="removeAction(index)">
                        </el-button>
                    </el-tooltip>
                </div>
                <el-button type="primary" icon='plus' size="mini" @click="addAction">
                    添加请求动作
                </el-button>
            
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancel">取 消</el-button>
            <el-button type="primary" @click="saveRule">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { cloneDeep } from 'lodash';
import uuidV4  from 'uuid/v4';
import ActionDetail from './ActionDetail'

function newRule() {
    let defaultRule = {
        method: '',
        match: '',
        name: '',
        checked: true,
        actionList: [{
            type: 'redirect',
            data: {
                target: '',
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
        }],
    }
    defaultRule.key = uuidV4();
    return defaultRule;
}

export default {
  name: 'edit-rule-dialog',
  components: {
      'action-detail': ActionDetail,
  },
  data() {
      const roleToClone = this.initRule || newRule
      return {
          rule: cloneDeep(roleToClone),
          formLabelWidth: '80px',
          methodlist: [
                    { value: '', label: '所有' },
                    { value: 'get', label: 'GET' },
                    { value: 'post', label: 'POST' },
                    { value: 'put', label: 'PUT' },
                    { value: 'patch', label: 'PATCH' },
                    { value: 'delete', label: 'DELETE' }
            ]
      }
  },
  methods: {
      addAction: function() {
          this.rule.actionList.push(cloneDeep(newRule().actionList[0]))
      },
      removeAction: function(index) {
          this.rule.actionList.splice(index, 1)
          if (!this.rule.actionList.length) {
            this.addAction() 
          }
      },
      saveRule: function() {
          this.save(this.rule);
      }
  },
  props: {
      visible: Boolean,
      initRule: Object,
      save: Function,
      cancel: Function,
  },
  watch: {
      visible: function(val) {
          if (val) {
            const ruleToClone = this.initRule || newRule();
            this.rule = cloneDeep(ruleToClone)
          }
      }
  },
  computed: {
      dialogVisible: {
          get() {
              return this.visible
          },
          set(val) {
              if (!val) {
                  this.cancel()
              }
          }
      }
  }
}
</script>

<style scoped>
    .action-container {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }
</style>
