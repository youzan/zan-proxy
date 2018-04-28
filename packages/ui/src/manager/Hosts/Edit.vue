<template>
  <el-dialog :visible.sync="visible">
    
  </el-dialog>
</template>

<script>
export default {
  name: 'HostsEdit',
  props: ['visible'],
  data() {
    return {
      form: {
        name: '',
        description: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入文件名称名称', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur',
          },
        ],
        description: [
          { required: true, message: '请填文件描述', trigger: 'blur' },
        ],
      },
    };
  },
};
</script>

<style lang="scss" scoped>

</style>

