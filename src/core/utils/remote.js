const axios = require("axios");
const queryString = require("query-string");
const log = require("./log");
const _ = require("lodash");
const http = require('http');
const https = require('https');
const toClientResponseUtils = require('./toClientResponseUtils');
const requestResponseUtils = require('./requestResponseUtils');
/**
 * 从远程服务器上获取响应内容
 */

let remote;

module.exports = class Remote {
    static getInstance() {
        if (!remote) {
            remote = new Remote();
        }
        return remote;
    }

    constructor() {
    }

    /**
     * 将请求远程的响应内容直接返回给浏览器
     */
    async pipe({
                   req, res, recordResponse,
                   method, protocol, hostname, path, port, headers, timeout, toClientResponse
               }) {
        // http.request 解析dns时，偶尔会出错
        // pipe流 获取远程数据 并做记录
        try {
            if (recordResponse) {
                toClientResponse.remoteRequestBeginTime = Date.now();
            }

            let proxyResponsePromise = this._requestServer({
                req, hostname,
                protocol, method, port, path,
                headers, timeout
            });
            // 记录日志
            let clientRequestPromise;
            if (recordResponse) {
                clientRequestPromise = requestResponseUtils.getClientRequestBody(req);
            }
            let proxyResponse = await proxyResponsePromise;
            toClientResponse.headers = _.assign({}, proxyResponse.headers, toClientResponse.headers);

            res.writeHead(proxyResponse.statusCode, toClientResponse.headers);
            // 向服务器返回发送给浏览器
            proxyResponse.pipe(res);
            toClientResponse.sendedToClient = true;

            if (recordResponse) {
                toClientResponse.remoteResponseStartTime = Date.now();
                toClientResponse.statusCode = proxyResponse.statusCode;
                let reqData = await clientRequestPromise;
                // http://cpro.baidustatic.com:80/cpro/ui/c.js 这个资源获取返回内容会出错
                let resData = await requestResponseUtils.getServerResponseBody(proxyResponse);
                toClientResponse.remoteResponseEndTime = Date.now();
                toClientResponse.body = resData;
                toClientResponse.hasContent = true;
                toClientResponse.requestData = {
                    method,
                    protocol,
                    port,
                    path,
                    headers,
                    body: reqData
                };
            }
        } catch (e) {
            let href = `${protocol}//${hostname}:${port}${path}`;
            toClientResponseUtils.setError(toClientResponse, href, e);
            log.error(hostname, href, e);
        }
    }

    /**
     * 将请求远程的响应内容
     */
    async cache({
                    req, res, recordResponse, method,
                    protocol, hostname, path, port,
                    headers, toClientResponse, timeout
                }) {

        try {
            toClientResponse.remoteRequestBeginTime = Date.now();

            let proxyResponsePromise = await this._requestServer({
                req, hostname,
                protocol, method, port, path,
                headers, timeout
            });

            // 记录日志
            let clientRequestPromise;
            if (recordResponse) {
                clientRequestPromise = requestResponseUtils.getClientRequestBody(req);
            }

            let proxyResponse = await proxyResponsePromise;

            toClientResponse.headers = _.assign({}, proxyResponse.headers, toClientResponse.headers);
            delete toClientResponse.headers['content-encoding'];
            delete toClientResponse.headers['transfer-encoding'];

            toClientResponse.remoteResponseStartTime = Date.now();
            toClientResponse.statusCode = proxyResponse.statusCode;
            let resData = await requestResponseUtils.getServerResponseBody(proxyResponse);
            toClientResponse.remoteResponseEndTime = Date.now();
            toClientResponse.body = resData;
            toClientResponse.hasContent = true;

            if (recordResponse) {
                let reqData = await clientRequestPromise;
                toClientResponse.requestData = {
                    method,
                    protocol,
                    port,
                    path,
                    headers,
                    body: reqData
                };
            }

        } catch (e) {
            let href = `${protocol}//${hostname}:${port}${path}`;
            toClientResponseUtils.setError(toClientResponse, href, e);
            log.error(hostname, href, e);
        }
    }

    /**
     * 根据RequestContent
     */
    async cacheFromRequestContent({ requestContent, recordResponse, toClientResponse, timeout }) {
        let { protocol, hostname, pathname, port, query, method, headers, body } = requestContent;
        try {
            toClientResponse.remoteRequestBeginTime = Date.now();
            let path = `${pathname}?${queryString.stringify(query)}`;
            let proxyResponse = await this._requestServer({
                body: requestContent.body,
                protocol, method, port, path,
                hostname, headers, timeout
            });

            toClientResponse.headers = _.assign({}, proxyResponse.headers, toClientResponse.headers);
            delete toClientResponse.headers['content-encoding'];
            delete toClientResponse.headers['transfer-encoding'];

            toClientResponse.remoteResponseStartTime = Date.now();

            toClientResponse.statusCode = proxyResponse.statusCode;
            let resData = await requestResponseUtils.getServerResponseBody(proxyResponse);
            toClientResponse.remoteResponseEndTime = Date.now();
            toClientResponse.body = resData;
            toClientResponse.hasContent = true;
            if (recordResponse) {
                toClientResponse.requestData = {
                    method,
                    protocol,
                    port,
                    path,
                    headers,
                    body: requestContent.body
                };
            }
        } catch (e) {
            let href = `${protocol}//${hostname}:${port}${pathname}?${queryString.stringify(query)}`;
            toClientResponseUtils.setError(toClientResponse, href, e);
            log.error(hostname, href, e);
        }
    }

    // 请求远程服务器，并将响应流通过promise的方式返回
    _requestServer({ req, body, protocol, method, hostname, port, path, headers, timeout = 10000 }) {
        let proxyRequestPromise = new Promise((resolve, reject) => {
            let client = protocol === 'https:' ? https : http;
            let proxyRequest = client.request({
                protocol,
                method,
                port,
                path,
                hostname,
                headers,
                timeout,
                rejectUnauthorized: false
            }, (proxyResponse) => {
                // 有响应时返回promise
                resolve(proxyResponse);
            });
            proxyRequest.on('error', (e) => {
                reject(e);
            });
            if (req) {
                req.pipe(proxyRequest);
            } else {
                proxyRequest.end(body);
            }
        });
        return proxyRequestPromise;
    }
};