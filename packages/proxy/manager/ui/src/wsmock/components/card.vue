<template>
  <div class="card">
    <div class="header">
      <p class="name">WebSocket Mock</p>
      <p class="add" @click="requestAddSession">+</p>
    </div>
  </div>
</template>
<script>
  export default {
    methods: {
      onKeyup (e) {
        this.$dc.search(e.target.value);
      },
      requestAddSession(){
        this.$prompt('请输入要拦截的WebSocket url特征', '新建调试会话', {
          confirmButtonText: '新建会话',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          this.$dc.openSession(value);
        })
      }
    }
  };
</script>


<style scoped lang="postcss">
  .card {
    padding: 12px;
    border-bottom: solid 1px #24272C;

    .header {
      line-height: 45px;
      height: 45px;
      .name {
        display: inline-block;
        margin: 0 0 0 5px;
        font-size: 16px;
        vertical-align: top;
      }
      .add {
        line-height: 1;
        display: inline-block;
        font-weight: bold;
        font-size: 30px;
        height: 30px;
        vertical-align: top;
        margin-top:3px;
        margin-left: 5px;
        cursor: pointer;
      }
    }
    .search-container {
      margin-top: 10px;
    }
    .search {
      padding: 0 10px;
      width: 100%;
      font-size: 12px;
      color: #fff;
      height: 30px;
      line-height: 30px;
      border: solid 1px #3a3a3a;
      border-radius: 4px;
      outline: none;
      background-color: #26292E;
    }

  }

</style>
