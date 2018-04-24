const EventEmitter = require("events");
/**
 * 记录 用户 -> 连接 -> session
 */
module.exports = class WsMockService extends  EventEmitter{

    constructor(){
        super();
    }

    start(){

    }

    /**
     * 为用户分配一个连接id
     * @param userId
     */
    newConnectionId(userId) {

    }

    // 分配调试会话id
    createSession(userId,connectionId, urlPattern) {
        let sessionId = currentSessionId++;
        sessionIdInfo[sessionId] = {
            sessionId: sessionId, // 会话id
            socketId: socketId, // session对应的调试者socket id
            urlPattern: urlPattern,// url特征
            assigned: false, // 是否分配被调试的页面
            page: null // 会话对应的调试页面
        };
        return sessionId;
    }

    /**
     * 获取一个空闲session
     * @param clientIp
     * @param url
     */
    getFreeSession(clientIp, url) {
        /*
         let session = _.find(sessionIdInfo, function (sessionInfo) {
         return !sessionInfo.assigned && url.indexOf(sessionInfo.urlPattern) > -1;
         });
         if (!session) return false;
         // 分配mock终端，返回终端id
         session.assigned = true;
         return session.sessionId;
         */
        return -1;
    }

    pageConnected(sessionId) {

    }

    pageSendMessage(sessionId, message) {

    }

    pageClosed(sessionId) {

    }

    closeSession(sessionId) {

    }

    sendToPageMsg(sessionId, data) {

    }

    /**
     * 用户关闭连接，当一个用户没有连接时，关闭该用户的所有调试会话
     * @param userId
     * @param connectionId
     */
    connectionClosed(userId, connectionId) {

    }

    /**
     * 获取用户所有的调试会话
     * @param userId
     */
    getSessions(userId) {

    }

}