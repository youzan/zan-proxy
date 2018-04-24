<template>
  <header>
    <el-dropdown placement="start" :hide-on-click="false" @command="selectHostFile">
      <el-button type="text">
        Host 设置
        <i class="el-icon-caret-bottom el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <!-- host文件 -->
        <el-dropdown-item v-if="hostEnabled" command="__disabled__">
          禁用
        </el-dropdown-item>
        <el-dropdown-item v-if="!hostEnabled" command="__enabled__">
          启用
        </el-dropdown-item>
        <el-dropdown-item v-for="hostfile in hostList" :key="hostfile.id" :command="hostfile.name" :disabled="!hostEnabled">
          {{ hostfile.name }}
          <i class="el-icon-check" v-if="hostfile.checked" />
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown :hide-on-click="false" placement="start" @command="selectRuleFile">
      <el-button type="text">
        Rule 设置
        <i class="el-icon-caret-bottom el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <!-- rule文件 -->
        <el-dropdown-item v-if="ruleEnabled" command="__disabled__">
          禁用
        </el-dropdown-item>
        <el-dropdown-item v-if="!ruleEnabled" command="__enabled__">
          启用
        </el-dropdown-item>
        <el-dropdown-item v-for="rulefile in ruleList" :key="rulefile.id" :command="rulefile.name + '-%-' + rulefile.checked" :disabled="!ruleEnabled">
          {{ rulefile.name }}
          <i class="el-icon-check" v-if="rulefile.checked" />
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </header>
</template>

<script>
export default {
  data() {
    return {
      hostEnabled: false,
      hostList: [],
      ruleEnabled: false,
      ruleList: []
    }
  },
  methods: {
    selectHostFile() {},
    selectRuleFile() {}
  }
}
</script>

<style lang="scss" scoped>
header {
  background: #fff;
  left: 230px;
  color: #20a0ff;
  height: 72px;
  padding-left: 35px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  flex: 0 0;

  .el-dropdown {
    margin-right: 15px;
  }

  .el-button--small {
    padding: 9px 12px;
    border-radius: 3px;
  }
}
</style>

