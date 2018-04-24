<template>
  <div class="message" v-scroll-bottom>
    <ul v-if="$dc.currentSession">
      <li v-for="item,index in $dc.currentSession.messages">
        <p class="time" v-if="showTime(item, index)">
          <span>{{ item.date | time }} {{item.type == 'cmd' ? '- ' + item.content :''}}</span>
        </p>
        <div class="main" :class="{ self: item.type == 'me' }" v-if="item.type != 'cmd'">
           <span class="avatar avatar-img">
              {{item.type == 'me' ? '我' : $dc.currentSession.urlPattern.charAt(0)}}
            </span>
          <div class="text">{{ item.content }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
  import Vue from 'vue'
  export default {

    methods: {
        showTime(message,index) {
            // 5分钟显示一次时间
           return message.type == 'cmd' || index == 0 || (message.date.getTime() - this.$dc.currentSession.messages[index-1].date.getTime() > 5*60*1000)
        }
    },

    filters: {
      // 将日期过滤为 hour:minutes
      time (date) {
        if (typeof date === 'string') {
          date = new Date(date);
        }
        return date.getHours() + ':' + date.getMinutes();
      }
    },
    directives: {
      // 发送消息后滚动到底部
      'scroll-bottom': {
        componentUpdated(el){
          Vue.nextTick(() => {
            el.scrollTop = el.scrollHeight - el.clientHeight;
          });
        }
      }
    }
  };
</script>


<style lang="postcss" scoped>
  .message {
    padding: 10px 15px;
    overflow-y: scroll;

  li {
    margin-bottom: 15px;
  }

  .time {
    margin: 7px 0;
    text-align: center;

  >
  span {
    display: inline-block;
    padding: 0 18px;
    font-size: 12px;
    color: #fff;
    border-radius: 2px;
    background-color: #dcdcdc;
  }

  }
  .avatar {
    float: left;
    margin: 0 10px 0 0;
  }

  .text {
    display: inline-block;
    position: relative;
    padding: 0 10px;
    max-width: calc(100% - 40px);
    min-height: 30px;
    line-height: 2.5;
    font-size: 12px;
    text-align: left;
    word-break: break-all;
    background-color: #fafafa;
    border-radius: 4px;

  &
  :before {
    content: " ";
    position: absolute;
    top: 9px;
    right: 100%;
    border: 6px solid transparent;
    border-right-color: #fafafa;
  }

  }

  .self {
    text-align: right;

  .avatar {
    float: right;
    margin: 0 0 0 10px;
  }

  .text {
    background-color: #b2e281;

  &
  :before {
    right: inherit;
    left: 100%;
    border-right-color: transparent;
    border-left-color: #b2e281;
  }

  }
  }
  }
  .avatar-img {
    width: 30px;
    height: 30px;
    display: inline-block;
    border-radius: 15px;
    line-height: 30px;
    text-align: center;
    background-color: #808080;
    transform: rotate(20deg);
    color: #fff;
  }

  .message {
    height: calc(100% - 160px);
  }
</style>
