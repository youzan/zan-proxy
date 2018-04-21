<template>
  <div class="manager">
    <div class="title">插件管理</div>
    <div class="grids">
      <plugin v-for="p in plugins" :key="p.name" :plugin="p" :delete="deletePlugin" :setDisabled="setPluginDisabled" />
      <add :add="addPlugin"></add>
    </div>
  </div>
</template>

<script>
import Plugin from './Plugin'
import Add from './Add'

export default {
  name: 'manager',
  data () {
    return {
      plugins: []
    }
  },
  components: {
    'plugin': Plugin,
    'add': Add
  },
  methods: {
    fetch () {
      fetch('./plugins/list').then(res => {
        return res.json()
      }).then(res => {
        this.plugins = res.data.map(p => {
          return Object.assign(p, { url: `./${p.name}/` })
        })
      })
    },
    deletePlugin(name) {
       const loading = this.$loading({
          lock: true,
          text: '删除中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
      })
      return fetch(`./plugins/remove`, {
        method: 'post',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      })
      .then(res => {
        loading.close()
        if (res.status !== 200) {
          return Promise.reject('server error')
        }
        this.$message({
          message: '删除成功，重启后生效',
          type: 'success'
        })
        this.fetch()
      })
      .catch(e => {
        loading.close()
        this.$message.error('删除失败，请重试')
      })
    },
    addPlugin(name, registry) {
      const loading = this.$loading({
          lock: true,
          text: '添加中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
      })
      return fetch(`./plugins/add`, {
        method: 'post',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, registry })
      })
      .then(res => {
        loading.close()
        if (res.status !== 200) {
          return Promise.reject('server error')
        }
        this.$message({
          message: '添加成功，重启后生效',
          type: 'success'
        })
        this.fetch()
      })
      .catch(e => {
        loading.close()
        this.$message.error('添加失败，请重试')
      })
    },
    setPluginDisabled(name, disabled) {
      const loading = this.$loading({
          lock: true,
          text: '设置中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
      })
      return fetch(`./plugins/disabled`, {
        method: 'post',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, disabled })
      })
      .then(res => {
        loading.close()
        if (res.status !== 200) {
          return Promise.reject('server error')
        }
        this.$message({
          message: '设置成功，重启后生效',
          type: 'success'
        })
        this.fetch()
      })
      .catch(e => {
        loading.close()
        this.$message.error('设置失败，请重试')
      })
    },
  },
  mounted () {
    this.fetch()
  }
}
</script>

<style scoped>
  .manager {
    height: 100%;
  }
  .manager .title {
    font-size: 20px;
    padding: 20px;
    line-height: 1;
  }
  .manager .grids {
    display: flex;
    flex-direction: row;
  }
  .manager .grid {
    padding: 20px;
    margin: 20px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    background-color: #ffffff;
    width: 320px;
    height: 200px;
    box-sizing: border-box;
  }
  .manager .grid:hover {
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  }
</style>
