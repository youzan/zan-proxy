const net = require("net");
const ServiceRegistry = require("../../service");

// 对于https协议，client connect请求proxy proxy和https server建立链接
// 此字段记录proxy 请求内部https server链接 和 client的ip 之间的映射关系
// 方便 https server 处理请求时，能够找出对应的client ip
connectionClientIpMap = {};

let connectHandle = null;
// https ws wss 都会发送connect请求
// 代理服务器的目的只要抓取http https请求
// 折中方案：抓取所有的http请求、端口号为443的https请求
module.exports = class ConnectHandle {
    static getInstance(httpProxyPort, httpsProxyPort) {
        if (!connectHandle) {
            let appInfoService = ServiceRegistry.getAppInfoService();

            let httpProxyPort = appInfoService.getHttpProxyPort();
            let httpsProxyPort = appInfoService.getHttpsProxyPort();
            if (!httpsProxyPort || !httpProxyPort) {
                throw new Error(`代理端口出错，httpProxyPort: ${httpProxyPort}, httpsProxyPort: ${httpsProxyPort}`);
            }
            connectHandle = new ConnectHandle(httpProxyPort, httpsProxyPort);
        }
        return connectHandle;
    }

    constructor(httpProxyPort, httpsProxyPort) {
        this.httpProxyPort = httpProxyPort;
        this.httpsProxyPort = httpsProxyPort;
        this.logService = ServiceRegistry.getLogService();

    }

    async handle(req, socket, head) {
        let proxyHost = "127.0.0.1";
        let proxyPort;

        // connect请求时 如何判断连到的目标机器是不是https协议？
        // ws、wss、https协议都会发送connect请求
        let [host, targetPort] = req.url.split(":");
        console.log(typeof req.url, req.url, req.url.split(':'))
        if (targetPort == 443) {
            proxyPort = this.httpsProxyPort;
        } else { // 非443则放行,连到http服务器上
            proxyHost = host;// ws协议直接和远程服务器链接
            proxyPort = targetPort;
        }
        let requestPort = '';
        // 和远程建立链接 并告诉客户端
        let conn = net.connect(proxyPort, proxyHost, () => {
            // 记录发出请求端口 和 远程ip的映射关系
            let { port } = conn.address();
            requestPort = port;
            connectionClientIpMap[port] = socket.remoteAddress;
            socket.write('HTTP/' + req.httpVersion + ' 200 OK\r\n\r\n', 'UTF-8', function () {
                conn.pipe(socket);
                socket.pipe(conn);
            });
        });

        conn.on("error", e => {
            this.logService.error("err when connect to + " + proxyHost + " : " + proxyPort);
            this.logService.error(e);
            delete connectionClientIpMap[requestPort];
        });
        conn.on("close", e => {
            delete connectionClientIpMap[requestPort];
        });
    }

    static getProxyRequestPortMapedClientIp(requestPort) {
        return connectionClientIpMap[requestPort];
    }
};
