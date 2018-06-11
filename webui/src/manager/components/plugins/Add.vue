<template>
  <div class="add-btn grid" @click="showDialog">
    <i class="el-icon-plus"></i>
    <el-dialog title="添加插件" :visible.sync="dialogVisible" size="tiny" :modal-append-to-body="true" :before-close="handleClose">
      <el-form :model="plugin">
        <el-form-item label="包名" :label-width="formLabelWidth">
          <el-input v-model="plugin.name" auto-complete="off" placeholder="插件包名"></el-input>
        </el-form-item>
        <el-form-item label="registry" :label-width="formLabelWidth">
          <el-input v-model="plugin.registry" auto-complete="off" placeholder="https://registry.npmjs.org/"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="hideDialog">取 消</el-button>
        <el-button type="primary" @click="onConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    add: Function
  },
  data() {
    return {
      dialogVisible: false,
      plugin: {
        name: '',
        registry: ''
      },
      formLabelWidth: '120px'
    }
  },
  methods: {
    hideDialog(e) {
      if (this.dialogVisible) {
        e.stopPropagation()
        this.dialogVisible = false
      }
    },
    showDialog(e) {
      if (!this.dialogVisible) {
        this.plugin.name = ''
        this.plugin.registry = ''
        this.dialogVisible = true
      }
    },
    onConfirm(e) {
      const {
         name,
         registry
      } = this.plugin
      if (!name) {
        this.$message.error('请填写包名')
        return
      }
      this.add(name, registry).then(() => this.hideDialog(e))
    },

    handleClose(done) {
      // hack for element 1.4
      setTimeout(_ => done(),0);
    }
  }
}
</script>

<style scoped>
  .add-btn {
    align-items: center;
    justify-content: center;
    display: flex;
  }
  .add-btn .el-icon-plus {
    line-height: 1;
    font-size: 40px;
    color: #999;
  }
  .add-btn:hover .el-icon-plus {
    color: #409EFF;
  }
</style>
