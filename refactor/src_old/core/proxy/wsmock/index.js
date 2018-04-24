/**
 * Created by tsxuehu on 17/3/21.
 */
const ServiceRegistry = require("../../service");

/**
 * hack， 创建一个不监听端口的server，让wss暴露handleUpgrade函数
 */
const WebSocket = require('ws');
const http = require('http');
const wss = new WebSocket.Server({
    server: http.createServer(function (req, res) {
        res.end();
    })
});

/**
 * sessionId 及其对应的 信息说明
 * 信息说明格式为
 * sessionId
 * page
 */
let sessionIdPageMap = {};
let wsMock;

/**
 * websocket mock
 * 和ws mock responsitory通信 实现mock功能
 */
module.exports = class WsMock {

    static getInstance() {
        if (!wsMock) {
            wsMock = new WsMock();
        }
        return wsMock;
    }

    constructor() {
        this.wsMockService = ServiceRegistry.getWsMockService();
    }

    handleUpgrade(req, socket, head, sessionId, url) {

        this.wsMockService.pageConnected(sessionId);
        this.wsMockService.pageSendMessage(sessionId, '[url]: ' + url);
        wss.handleUpgrade(req, socket, head, function (page) {
            sessionIdPageMap[sessionId] = {page};
            // 浏览器页面发出的消息，转发给监控终端
            page.on('message', function (data) {
                this.wsMockService.pageSendMessage(sessionId, data);
            });

            page.on('close', function () {
                this.wsMockService.pageClosed(sessionId);
                // 调试结束 释放会话
                if (!sessionIdPageMap[sessionId]) return;
                sessionIdPageMap[sessionId].page = null;
            });
        });
    }

    /**
     * 向页面发送消息
     * @param sessionId
     * @param data
     */
    sendToPageMsg(sessionId, data) {
        sessionIdPageMap[sessionId].page && sessionIdPageMap[sessionId].page.send(data);
    }

    /**
     * 关闭会话，向会话关联的页面发送关闭通知
     */
    closeSession(sessionId) {
        sessionIdPageMap[sessionId] && sessionIdPageMap[sessionId].page && sessionIdPageMap[sessionId].page.close();
        delete sessionIdPageMap[sessionId];
    }

    /**
     * 批量关闭session，用户所有的ws mock界面关闭时，会批量关闭调试会话
     * @param sessionIds
     */
    closeSessionBatch(sessionIds) {
        for (let sessionId of sessionIds) {
            this.closeSession(sessionId);
        }
    }
};