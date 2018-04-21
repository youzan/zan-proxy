<template>
  <div class="left-menu">
    <h2>Zan Proxy</h2>
    <el-menu
      class="el-menu-vertical-demo"
      theme="dark"
      :default-active="defaultActive"
      @select="handleSelect"
    >
      <template v-for="(item,index) in menuList">
        <div :key="index">
          <el-submenu :index="index + ''" v-if="item.children">
            <!-- 菜单标题 -->
            <template slot="title">
              <i class="iconfont" :class="item.icon" />
              <span class='menu-name'>{{item.name}}</span>
            </template>
            <!-- 子菜单 -->
            <el-menu-item 
              v-for='(child,cindex) in item.children'
              :style="{'padding-left':'40px'}"
              :index='index+"-"+cindex'
              :key="cindex"
            >
              <i class="iconfont" :class="child.icon" />
              <span class='menu-name'>
                {{ child.name }}
              </span>
            </el-menu-item>
          </el-submenu>
          <!-- 子菜单 -->
          <el-menu-item :index="index + ''" v-else>
            <i class="iconfont" :class="item.icon" />
            <span class='menu-name'>
              {{ item.name }}
            </span>
          </el-menu-item>
        </div>
      </template>
    </el-menu>
  </div>
</template>

<script>
const menuList = [
  {
    name: '使用说明',
    icon: 'icon-search',
    link: 'helpinstall'
  },
  {
    name: '工程路径配置',
    icon: 'icon-layers',
    link: 'projectpath'
  },
  {
    name: 'Host 管理',
    icon: 'icon-box',
    link: 'hostfilelist'
  },
  {
    name: 'Http 转发',
    icon: 'icon-skip',
    link: 'rulefilelist'
  },
  {
    name: '自定义 mock 数据',
    icon: 'icon-suoding',
    link: 'datalist'
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
    link: 'https://youzan.github.io/zan-proxy/',
    targetBlank: true
  },
  {
    name: '插件管理',
    icon: 'icon-layers',
    link: 'plugins'
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
];

export default {
  name: 'left-menu',

  data() {
    return {
      defaultActive: this.getDefaultActive(),
      menuList
    };
  },

  methods: {
    getDefaultActive() {
      const { hash } = location;
      let defaultActive = '';
      menuList.forEach((item, index1) => {
        if (Array.isArray(item)) {

        } else if (hash.indexOf(item.link) !== -1) {
          defaultActive = index1 + '';
        }
      });

      return defaultActive;
    },

    handleSelect(key, keyPath) {
      let item = {};
      if (keyPath.length == 2) {
        var indexarray = keyPath[1].split('-');
        item = this.menuList[indexarray[0]]['children'][indexarray[1]];
      } else {
        item = this.menuList[parseInt(key)];
      }

      if (item.targetBlank) {
        window.open(item['link']);
      } else {
        this.$router.push(item['link']);
      }
    }
  }
};
</script>

<style scoped>
.left-menu {
  z-index: 1;
  width: 230px;
  height: 100%;
  user-select: none;
  position: relative;
  overflow-x: hidden;
  background-image: linear-gradient(#3b3e8f, #6f73d7);

  h2 {
    color: #fff;
    font-size: 20px;
    line-height: 72px;
    padding-left: 22px;
    font-weight: normal;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-family: Dosis, Source Sans Pro, Helvetica Neue, Arial, sans-serif;
  }

  .iconfont {
    width: 28px;
    display: inline-block;
  }

  .icon-bargraph {
    font-size: 15px;
  }

  .icon-set,
  .icon-skip,
  .icon-box {
    opacity: .8;
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
