<template>
  <div class="left-menu">
    <h2 class="title">Zan Proxy</h2>
    <el-menu theme="dark" :default-active="activeKey" @select="handleSelect">
      <el-menu-item v-for="item in menuList" :key="item.name" :index="item.link">
        <i :class="['left-menu-icon', { iconfont: !item.isElIcon }, item.icon]" />
        <span class="menu-name">{{ item.name }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import 'vue-router';
import { Component } from 'vue-property-decorator';

interface IMenuItem {
  name: string;
  icon: string;
  isElIcon?: boolean;
  link: string;
  newPage?: boolean;
  pathPrefix?: string;
}

const menuList: IMenuItem[] = [
  {
    name: '使用说明',
    icon: 'icon-search',
    link: '/intro',
    pathPrefix: '/intro',
  },
  {
    name: 'Host 管理',
    icon: 'icon-box',
    link: '/host',
    pathPrefix: '/host',
  },
  {
    name: '转发规则',
    icon: 'icon-skip',
    link: '/rule',
    pathPrefix: '/rule',
  },
  {
    name: '转发变量',
    icon: 'icon-layers',
    link: '/profile',
    pathPrefix: '/profile',
  },
  {
    name: 'Mock 数据',
    icon: 'icon-suoding',
    link: '/mock',
    pathPrefix: '/mock',
  },
  {
    name: '请求监控',
    icon: 'icon-bargraph',
    link: '/monitor.html',
    newPage: true,
  },
  {
    name: '帮助文档',
    icon: 'icon-security',
    link: 'https://youzan.github.io/zan-proxy/',
    newPage: true,
  },
  {
    name: '插件管理',
    icon: 'icon-layers',
    link: '/plugins',
    pathPrefix: '/plugins',
  },
  {
    name: '其他设置',
    icon: 'el-icon-setting',
    isElIcon: true,
    link: '/other-setting',
    pathPrefix: '/other-setting',
  },
];

@Component
export default class LeftMenu extends Vue {
  menuList = menuList;

  get activeKey() {
    const path = this.$route.path;
    const item = this.menuList.find(item => path.startsWith(item.link));
    return item && item.pathPrefix;
  }

  handleSelect(key: string) {
    const item = this.menuList.find(item => item.link === key);

    if (!item) {
      return;
    }

    if (item.newPage) {
      window.open(item.link);
    } else {
      this.$router.push(item.link);
    }
  }
}
</script>

<style lang="scss" scoped>
.left-menu {
  z-index: 1;
  width: 230px;
  height: 100%;
  user-select: none;
  position: relative;
  overflow-x: hidden;
  background-color: #4b4eac;

  .title {
    position: fixed;
    z-index: 10;
    width: 230px;
    background-color: #4b4eac;
    color: #fff;
    font-size: 20px;
    line-height: 60px;
    padding-left: 22px;
    font-weight: normal;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-family: Dosis, Source Sans Pro, Helvetica Neue, Arial, sans-serif;
  }

  &-icon {
    display: inline-block;
    width: 24px;
    margin-right: 16px;
    font-size: 16px;
  }

  .icon-bargraph {
    font-size: 15px;
  }

  .icon-set,
  .icon-skip,
  .icon-box {
    opacity: 0.8;
  }

  .el-menu {
    background-color: transparent;
    border-right: none;
    position: relative;
    top: 60px;
  }

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
