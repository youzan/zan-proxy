const url = require("url");
const WsMock = require("../wsmock");
const HttpProxy = require("http-proxy");
const ServiceRegistry = require("../../service");
// const getClientIp = require("../../utils/getClientIp");

let wsHandle;
module.exports = class WsHandle {
    static getInstance() {
        if (!wsHandle) {
            wsHandle = new WsHandle();
        }
        return wsHandle;
    }

    constructor() {
        // this.logService = ServiceRegistry.getLogService();
        this.hostService = ServiceRegistry.getHostService();
        // this.wsMockService = ServiceRegistry.getWsMockService();
        // 创建httpProxy
        this.proxy = HttpProxy.createProxyServer({
            secure: false // http-proxy api  在request的option里设置 rejectUnauthorized = false
        });
        this._registHandleForWSProxy(this.proxy);

        this.wsMock = WsMock.getInstance();
    }

    // websocket请求转发 ws测试服务器ws://echo.websocket.org/
    async handle(req, socket, head) {
        // 分配ws mock终端，没有分配到终端的和远程建立连接，分配到mock终端的和mock终端通信
        let host = req.headers.host.split(':')[0];
        let port = req.headers.host.split(':')[1];
        let path = url.parse(req.url).path;
        let protocal = (!!req.connection.encrypted && !/^http:/.test(req.url)) ? "https" : "http";
        // let clientIp = getClientIp(req);
        // let sessionId = this.wsMockService.getFreeSession(clientIp, req.headers.host + path);
        if (false) {
            // 有监控的客户端
            this.wsMock.handleUpgrade(req, socket, head, sessionId, req.headers.host + path)
        } else { // 不需要监听ws
            this.proxy.ws(req, socket, head, {
                target: {
                    protocol: protocal,
                    hostname: host,
                    port: port || (protocal == 'http' ? 80 : 443)
                }
            });
        }
    }

    _registHandleForWSProxy(proxy) {
        proxy.on('proxyReqWs',  (proxyReq, req, socket, options, head) => {

        });
        proxy.on('open',  (proxySocket) => {

        });
        proxy.on('close',  (proxyRes, proxySocket, proxyHead) => {

        });
        proxy.on('error',  (err, req, socket) => {
            // this.logService.error(err);
        });
    }
}
