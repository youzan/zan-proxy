<template>
  <div class="plugin grid" :class="{deleted: isDeleted}" @click="toPlugin">
    <div class="header">
      <span class="name">{{ plugin.name }}</span>
      <span class="version">{{ plugin.version }}</span>
    </div>
    <div class="body">
      <p class="description">
        {{ plugin.description }}
      </p>
    </div>
    <div class="footer">
      <el-dropdown @command="onSetDisabled">
        <el-button type="primary" icon="setting" @click="e => e.stopPropagation()">
          {{ disabledText }}
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="false">
            启用<i class="el-icon-check icon-checked" v-if="!plugin.disabled"></i>
          </el-dropdown-item>
          <el-dropdown-item :command="true">
            禁用<i class="el-icon-check icon-checked" v-if="plugin.disabled"></i>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button type="danger" icon="delete" @click="onDelete">
        卸载
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'plugin',
  props: {
    plugin: Object,
    delete: Function,
    setDisabled: Function,
  },
  data() {
    return {
      isDeleted: false
    }
  },
  methods: {
    toPlugin () {
      window.open(`./plugins/${this.plugin.name}/`, '_blank')
    },
    onDelete(e) {
      e.stopPropagation()
      this.delete(this.plugin.name)
    },
    onSetDisabled(command) {
      this.setDisabled(this.plugin.name, command)
    },
  },
  computed: {
    disabledText() {
      if (this.plugin.disabled) {
        return '已禁用'
      }
      return '已启用'
    },
  }
}
</script>

<style scoped>
  .plugin {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .plugin .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .plugin .body {
    flex: 1;
  }

  .plugin .name {
    font-size: 18px;
    color: #333333;
  }

  .plugin .version {
    font-size: 12px;
    color: #aaaaaa;
  }

  .plugin .description {
    font-size: 14px;
    color: #999999;
  }

  .plugin .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: row;
  }
  .plugin .footer .el-button {
    margin-left: 10px;
  }
  .icon-checked {
    margin-left: 10px;
    color: #67C23A;
  }
</style>
