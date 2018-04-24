<template>
  <div>
    <div class="main-content__title">工程路径管理</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="6" :offset="18" style="text-align:right">
        <el-button size="small" @click='save' type="primary">保存工程路径设置</el-button>
        <el-button size="small" @click='addParam'>增加工程路径设置</el-button>
      </el-col>
    </el-row>
    <el-table border align="center" :data="list">
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="key" label="工程名" width="200">
        <template slot-scope='scope'>
          <el-input v-model="scope.row.name" size="small" placeholder="请输入工程名"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="value" label="工程路径">
        <template slot-scope="scope">
          <el-input v-model="scope.row.value" size="small" placeholder="请输入工程路径"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="136" :context="_self">
        <template slot-scope='scope'>
          <el-button type="danger" icon='delete' size="mini" @click="deleteByName(scope.row.name)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const projectPaths = gql`
  query {
    projectPaths {
      name
      value
    }
  }
`

const save = gql`
  mutation($list: [InputProjectPath]) {
    saveProjectPaths(list: $list) {
      name
      value
    }
  }
`

const deleteByName = gql`
  mutation ($name: String!) {
    deleteProjectPath(name: $name) {
      name
      value
    }
  }
`

export default {
  name: 'project-path',
  apollo: {
    projectPaths
  },
  data() {
    return {
      list: [],
      projectPaths: []
    }
  },
  watch: {
    projectPaths(value) {
      this.list = value.map(({ name, value }) => ({
        name,
        value
      }))
    }
  },
  methods: {
    async deleteByName(name) {
      await this.$confirm('此操作不可恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await this.$apollo.mutate({
        mutation: deleteByName,
        variables: {
          name
        },
        update: (store, { data: { saveProjectPaths } }) => {
          const data = store.readQuery({ query: projectPaths })
          data.projectPaths.splice(0, data.projectPaths.length, ...saveProjectPaths)
          store.writeQuery({ query: projectPaths, data })
        }
      })
      this.$notify({
        title: '删除成功',
        message: '删除成功',
        type: 'success'
      })
    },

    async save() {
      const list = this.list.filter(({ name }) => !!name)
      await this.$apollo.mutate({
        mutation: save,
        variables: {
          list
        },
        update: (store, { data: { saveProjectPaths } }) => {
          const data = store.readQuery({ query: projectPaths })
          data.projectPaths.splice(0, data.projectPaths.length, ...saveProjectPaths)
          store.writeQuery({ query: projectPaths, data })
        }
      })
      this.$notify({
        title: '保存成功',
        message: '保存成功',
        type: 'success'
      })
      // this.$apollo.queries.projectPaths.refresh()
    },

    addParam() {
      this.list.push({
        name: '',
        value: ''
      })
    }
  }
}
</script>
