<template>
  <div id="app">
    <div class="sidebar">
      <card></card>
      <list></list>
    </div>
    <div class="main">
      <message></message>
      <textinput></textinput>
    </div>
  </div>
</template>
<script>
  import Card from 'src/wsmock/components/card';
  import List from 'src/wsmock/components/list';
  import Textinput from 'src/wsmock/components/textinput';
  import Message from 'src/wsmock/components/message';
  import _ from 'lodash';
  var socket = null;
  var localIdX = 1;
  export default {
    components: {Card, List, Textinput, Message},
    data(){
      return {
        isDataCenter: true,
        // debug会话列表
        sessions: [],
        // 当前选中的会话
        currentSessionLocalId: 1,
        // 过滤出只包含这个key的会话
        filterKey: ''
      }
    },
    methods: {
      search(keyword){
          // 设置debounce
        this.filterKey =keyword;
      },
      selectSession(localId){
        this.currentSessionLocalId = localId;
        this.currentSession.hasNewMsg = false;
      },
      comingMsg(session){
        if (session.localId == this.currentSession.localId) return;
        session.hasNewMsg = true;
      },
      openSession(urlPattern){
        /**
         * 消息格式为
         *  {
                content: '项目地址: https://github.com/coffcer/vue-chat',
                date: new Date(),
                type: 'page'
              }
         分为三种类型：me（调试者发出的）, page(页面发出的) , cmd(控制信息)
         */
        var id = localIdX++;
        this.currentSessionLocalId = id;
        this.sessions.push({
          localId: id, // 本地id
          sessionId: '', // 服务器分配的会话id
          hasNewMsg: false,
          urlPattern: urlPattern,
          messages: [
            {
              content: '等待服务器分配调试会话ID',
              date: new Date(),
              type: 'cmd'
            }
          ]
        });
          // todo http接口
        socket.emit('opensession', urlPattern);
      },
      closeSession(localId){
        var index = _.findIndex(this.sessions, (session) => {
          return session.localId == localId;
        });
        var sesionId = this.sessions[index].sessionId;

        this.sessions.splice(index, 1);
        // todo http接口
        socket.emit('closesession', sesionId);

        // 重新选择当前会话
        if (this.currentSessionLocalId == localId) {
          if (index > 0) index--;
          this.currentSessionLocalId = this.sessions[index] && this.sessions[index].localId;
        }
      },
      assignedSessionId(urlPattern, sessionId){
        var session = _.find(this.sessions, (session) => {
          return session.urlPattern == urlPattern;
        });
        if (!session) return;
        session.sessionId = sessionId;
        this.comingMsg(session);
        session.messages.push({
          content: '分配到调试会话ID: ' + sessionId,
          date: new Date(),
          type: 'cmd'
        })

      },
      // 和页面建立调试链接
      connectionBuild(sessionId){
        var session = _.find(this.sessions, (session) => {
          return session.sessionId == sessionId;
        });
        if (!session) return;
        this.comingMsg(session);
        session.messages.push({
          content: '和目标页面建立调试连接',
          date: new Date(),
          type: 'cmd'
        });
      },
      sendMsg(data){
        if (!this.currentSession) return;
        this.currentSession.messages.push({
          content: data,
          date: new Date(),
          type: 'me'
        });
          // todo http接口
        socket.emit('debuggermsg', this.currentSession.sessionId, data);
      },
      recieve(sessionId, data){
        var session = _.find(this.sessions, (session) => {
          return session.sessionId == sessionId;
        });
        if (!session) return;
        this.comingMsg(session);
        session.messages.push({
          content: data,
          date: new Date(),
          type: 'page'
        });
      },
      connectionBreak(sessionId){
        var session = _.find(this.sessions, (session) => {
          return session.sessionId == sessionId;
        });
        if (!session) return;
        this.comingMsg(session);
        session.messages.push({
          content: '页面终止调试会话，等待新的页面接入调试会话',
          date: new Date(),
          type: 'cmd'
        });
      }

    },
    computed: {
      currentSession(){
        return _.find(this.sessions, (session) => {
          return session.localId == this.currentSessionLocalId;
        })
      }
    },
    created() {
      if (!window.io) return;
      socket = io('/wsmock');
      socket.on('assignedsessionid', this.assignedSessionId);
      socket.on('page-msg', this.recieve);
      socket.on('page-connected', this.connectionBuild);
      socket.on('page-closed', this.connectionBreak);
    },
  }
</script>


<style lang="postcss">
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
  #app {
    margin: 20px auto;
    width: 800px;
    height: 600px;

    overflow: hidden;
    border-radius: 3px;

  .sidebar, .main {
    height: 100%;
  }

  .sidebar {
    float: left;
    width: 200px;
    color: #f4f4f4;
    background-color: #2e3238;
  }

  .main {
    position: relative;
    overflow: hidden;
    background-color: #eee;
  }

  }
  * {
    box-sizing: border-box;
  }

  *:before, *:after {
    box-sizing: inherit;
  }

  body, html {
    height: 100%;
    overflow: hidden;
  }

  body, ul {
    margin: 0;
    padding: 0;
  }

  body {
    color: #4d4d4d;
    font: 14px/1.4em 'Helvetica Neue', Helvetica, 'Microsoft Yahei', Arial, sans-serif;
    background-size: cover;
    font-smoothing: antialiased;
  }

  ul {
    list-style: none;
  }

</style>
