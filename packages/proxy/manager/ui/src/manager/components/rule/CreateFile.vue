<template>
    <div>
        <div class="main-content__title">创建规则集</div>
        <el-form :model="createFileForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" style="margin:20px;width:60%;min-width:600px;">
            <el-form-item label="规则集名字" prop="name">
                <el-input v-model="createFileForm.name"></el-input>
            </el-form-item>
            <el-form-item label="规则集描述" prop="description">
                <el-input type="textarea" v-model="createFileForm.description"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
                <el-button @click="back()">返回</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import ruleApi from '../../../api/rule'
    export default {
        name: 'app',
        data() {
            return {
                createFileForm: {
                    name: '',
                    checked: true,
                    description: ''
                },
                rules: {
                    name: [
                        { required: true, message: '请输入文件名称名称', trigger: 'blur' },
                        { min: 2, max: 50, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: '请填文件描述', trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        ruleApi.createFile(this.createFileForm.name, this.createFileForm.description).then((response) => {
                            var serverData = response.data;
                            if (serverData.code == 0) {
                                // 判断创建成功还是失败
                                this.$message({
                                    message: '恭喜你，创建成功',
                                    type: 'success'
                                });
                              this.$router.push(`editrule?name=${this.createFileForm.name}`);
                            } else {
                                this.$message.error(`出错了，${serverData.msg}`);
                            }
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
          back() {
            this.$router.push('rulefilelist');
            }
        }
    }

</script>
