/**
 * Created by tsxuehu on 8/22/17.
 */

const http = require("http");
const HttpHandle = require("./handle/httpHandle");
const ConnectHandle = require("./handle/connectHandle");
const WsHandle = require("./handle/wsHandle");

/**
 * 1、接受浏览器发出的connect请求（ws、wss、https）
 * 2、转发http请求
 * 3、转发 ws请求
 */
module.exports = class HttpServer {
    constructor(httpPort, httpsPort) {
        this.httpPort = httpPort;
        this.httpsPort = httpsPort;
        this.connectHandle = ConnectHandle.getInstance(this.httpPort, this.httpsPort);
        this.httpHandle = HttpHandle.getInstance();
        this.wsHandle = WsHandle.getInstance();


    }

    start() {
        //creat proxy server
        this.httpProxyServer = http.createServer();
        // 事件监听函数的this指针会被改变
        let that = this;
        // request handle
        this.httpProxyServer.on('request', (req, res) => {
            that.httpHandle.handle(req, res).catch(e => {
                console.error(e);
            });

        });
        // handle CONNECT request for https over http
        this.httpProxyServer.on('connect', (req, res) => {
            that.connectHandle.handle(req, res).catch(e => {
                console.error(e);
            });

        });
        // websocket 请求处理
        this.httpProxyServer.on('upgrade', (req, res) => {
            that.wsHandle.handle(req, res).catch(e => {
                console.error(e);
            });

        });
        //start proxy server 捕获端口冲突

        this.httpProxyServer.on('error', function (err) {
            console.log(err);
            process.exit(0);
        });

        this.httpProxyServer.listen(this.httpPort, "0.0.0.0");
    }
};