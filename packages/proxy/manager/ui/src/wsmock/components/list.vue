<template>
  <div class="list">
    <ul>
      <li v-for="item in $dc.sessions" :class="{ active: item.localId === $dc.currentSession.localId , newmsg: item.hasNewMsg }" class="session-row"
          @click="$dc.selectSession(item.localId)">
        <span class="avatar avatar-img">
          {{item.urlPattern.charAt(0)}}
        </span>
        <p class="name">{{item.urlPattern}}</p>
        <p class="msg-state"></p>
        <p class="close" @click="$dc.closeSession(item.localId)">X</p>
      </li>
    </ul>
  </div>
</template>
<script>
  export default {
  };
</script>


<style scoped lang="postcss">
  .list {

      li {
        padding: 12px 15px;
        border-bottom: 1px solid #292C33;
        cursor: pointer;
        transition: background-color .1s;


      &:hover {
        background-color: rgba(255, 255, 255, 0.03);
      }


      &.active {
        background-color: rgba(255, 255, 255, 0.1);
      }

      }
      .avatar, .name {
        vertical-align: middle;
      }

      .name {
        display: inline-block;
        margin: 0 0 0 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 120px;
      }

  }
  .session-row {
    position: relative;
  }
  .newmsg {
      .msg-state {
        position: absolute;
        background-color: #00ff00;
        width: 8px;
        height: 8px;
        border-radius: 4px;
        top: 22px;
        right: 25px;
      }
  }
  .close{
    position: absolute;
    top: 18px;
    right: 5px;
  }
</style>
