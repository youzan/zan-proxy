<template>
    <el-dialog title="编辑" :visible.sync="dialogVisible" @close="cancel">
        <el-form>
            <el-form-item label="规则集名称" label-width="120px">
               <el-input v-model="name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="规则集描述" label-width="120px">
               <el-input type="textarea" v-model="description" auto-complete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancel">取 消</el-button>
            <el-button type="primary" @click="ok(name, description)">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>

export default {
  name: 'edit-rule-name-dialog',
  data() {
      return {
          name: '',
          description: '',
      }
  },
  props: {
      visible: Boolean,
      ok: Function,
      cancel: Function,
      defaultName: {
          type: String,
          default: ''
      },
      defaultDescription: {
          type: String,
          default: ''
      }
  },
  watch: {
      defaultName(value) {
          this.name = value;
      },
      defaultDescription(value) {
          this.description = value;
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
