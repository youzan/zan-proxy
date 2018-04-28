<template>
  <div class="app">
    <LeftMenu />
    <div class="content">
      <Header />
      <div class="router-view">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import LeftMenu from './LeftMenu'

import '../base.css'

export default {
  components: {
    Header,
    LeftMenu
  }
}
</script>

<style lang="scss" scoped>
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
}
.content {
  flex: 1 1;
  display: flex;
  flex-direction: column;
}
.router-view {
  flex: 1 1;
  overflow: auto;
}
</style>

