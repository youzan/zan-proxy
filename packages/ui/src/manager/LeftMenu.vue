<template>
  <div class="sidebar">
    <h1>Zan Proxy</h1>
    <el-menu :default-active="defaultActive" text-color="#fff" active-text-color="#ffd04b" router>
      <template v-for="(item, index) in menuList">
        <el-submenu v-if="item.children" :key="index" :index="index.toString()">
          <template slot="title">
            <i class="iconfont" :class="item.icon" />
            <span class='menu-name'>{{item.name}}</span>
          </template>
          <el-menu-item v-for='(child,cindex) in item.children' :style="{'padding-left':'40px'}" :index="child.link" :key="cindex">
            <i class="iconfont" :class="child.icon" />
            <span class='menu-name'>
              {{ child.name }}
            </span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-else :key="index" :index="item.link">
          <i class="iconfont" :class="item.icon" />
          <span class='menu-name'>
            {{ item.name }}
          </span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
const menuList = [
  {
    name: '使用说明',
    icon: 'icon-search',
    link: '/helpinstall'
  },
  {
    name: '工程路径配置',
    icon: 'icon-layers',
    link: '/projectpath'
  },
  {
    name: 'Host 管理',
    icon: 'icon-box',
    link: '/hosts'
  },
  {
    name: 'Http 转发',
    icon: 'icon-skip',
    link: '/rulefilelist'
  },
  {
    name: '自定义 mock 数据',
    icon: 'icon-suoding',
    link: '/datalist'
  },
  {
    name: '请求监控',
    icon: 'icon-bargraph',
    link: '/monitor.html',
    targetBlank: true
  },
  {
    name: '帮助中心',
    icon: 'icon-security',
    link: '/help/index.html',
    targetBlank: true
  },
  {
    name: '插件管理',
    icon: 'icon-layers',
    link: '/pluginmanager'
  }
  // {
  //   name: '断点',
  //   icon: 'icon-remind',
  //   link: '/breakpoint.html',
  //   targetBlank: true
  // },
  // {
  //   name: 'WebSocket Mock',
  //   icon: 'icon-hot',
  //   link: '/wsmock.html',
  //   targetBlank: true
  // },
]

export default {
  data() {
    return {
      menuList
    }
  },
  computed: {
    defaultActive() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 230px;
  flex: 0 0 230px;
  overflow-x: hidden;
  user-select: none;
  background: linear-gradient(#3b3e8f, #6f73d7);

  h1 {
    color: #fff;
    font-size: 20px;
    line-height: 72px;
    padding-left: 22px;
    font-weight: normal;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-family: Dosis, Source Sans Pro, Helvetica Neue, Arial, sans-serif;
  }

  .el-menu {
    background-color: transparent;
  }

  .el-submenu__title,
  .el-menu-item {
    color: #fff;
    height: 52px;
    line-height: 52px;
    border-left: 3px solid transparent;

    &.is-active,
    &:hover {
      background-color: #393c89;
    }

    &.is-active {
      border-color: #32e7d7;
    }
  }
}
</style>
