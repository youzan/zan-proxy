const Action = require("./action");
const _ = require("lodash");
const ServiceRegistry = require("../../service");
const Local = require("../../utils/local");
const toClientResponseUtils = require("../../utils/toClientResponseUtils");
const url = require("url");
const Remote = require("../../utils/remote");
const addHeaderToResponse = require("../../utils/addHeaderToResponse");
const cookie2Str = require("../../utils/cookie2Str");

/**
 * 重定向 本地 或者 远程
 */
let redirect;
module.exports = class Redirect extends Action {
    static getInstance() {
        if (!redirect) {
            redirect = new Redirect();
        }
        return redirect;
    }

    constructor() {
        super();
        this.hostRepository = ServiceRegistry.getHostService();
        this.profileService = ServiceRegistry.getProfileService();
        this.remote = Remote.getInstance();
        this.local = Local.getInstance();
    }

    needRequestContent() {
        return false;
    }

    needResponse() {
        return false;
    }

    willGetContent() {
        return true;
    }

    /**
     * 运行处理动作
     */
    async run({
                  req,
                  res,
                  recordResponse,
                  urlObj,
                  clientIp,
                  userId,
                  rule, // 规则
                  action, // 规则里的一个动作
                  requestContent, // 请求内容
                  additionalRequestHeaders, // 请求头
                  actualRequestHeaders,
                  additionalRequestCookies, // cookie
                  actualRequestCookies,
                  toClientResponse, //响应内容
                  last = true
              }) {
        //================== 转发到本地 或远程
        let { href } = urlObj;
        let target = '';
        // 解析目标
        try {
            target = this.profileService.calcPath(userId, href, rule.match, action.data.target);
            if (!target) {
                throw new Error("target parse empty ");
            }
        } catch (e) {
            toClientResponseUtils.setError(toClientResponse, action.data.target, e);
            return;
        }
        // 远程
        if (target.startsWith('http')) {
            await this._toRemote({
                req,
                res,
                recordResponse,
                clientIp,
                target,
                additionalRequestHeaders, // 请求头
                actualRequestHeaders,
                additionalRequestCookies, // cookie
                actualRequestCookies,
                toClientResponse,
                last
            });
        } else {// 本地文件
            await this._toLocal({
                req,
                res,
                clientIp,
                target,
                rule,
                action,
                requestContent,
                additionalRequestHeaders,
                toClientResponse,
                last
            });
        }
    }

    async _toRemote({
                        req,
                        res,
                        recordResponse,
                        clientIp,
                        userId,
                        target,
                        additionalRequestHeaders, // 请求头
                        actualRequestHeaders,
                        additionalRequestCookies, // cookie
                        actualRequestCookies,
                        toClientResponse, //响应内容
                        last
                    }) {
        let redirectUrlObj = url.parse(target);
        let { protocol, hostname, path, port } = redirectUrlObj;

        // dns解析
        toClientResponse.dnsResolveBeginTime = Date.now();
        let ip = '';
        try {
            ip = await this.hostService.resolveHost(userId, hostname);
        } catch (e) {
            let href = `${protocol}//${hostname}:${port}${path}`;
            toClientResponseUtils.setError(toClientResponse, href, e);
            return;
        }
        toClientResponse.headers['remote-ip'] = ip;
        toClientResponse.remoteIp = ip;

        port = port || ('https:' == protocol ? 443 : 80);

        let targetUrl = protocol + '//' + ip + ':' + port + path;
        toClientResponse.headers['fe-proxy-content'] = encodeURI(targetUrl);

        Object.assign(actualRequestHeaders, req.headers);
        actualRequestHeaders['host'] = hostname;
        Object.assign(actualRequestHeaders, additionalRequestHeaders);
        Object.assign(actualRequestCookies, additionalRequestCookies);
        actualRequestHeaders.cookie = cookie2Str(actualRequestCookies);

        if (last) {
            addHeaderToResponse(res, toClientResponse.headers);
            await this.remote.pipe({
                req, res, recordResponse,
                method: req.method,
                protocol, hostname: ip, path, port,
                headers: actualRequestHeaders, toClientResponse
            });
        } else {
            await this.remote.cache({
                req, res,
                method: req.method,
                protocol, hostname: ip, path, port,
                headers: actualRequestHeaders, toClientResponse
            });
        }
    }

    async _toLocal({
                       req,
                       res,
                       recordResponse,
                       urlObj,
                       clientIp,
                       target,
                       rule, // 规则
                       action, // 规则里的一个动作
                       requestContent, // 请求内容
                       additionalRequestHeaders, // 请求头
                       toClientResponse, //响应内容
                       last
                   }) {

        toClientResponse.headers['fe-proxy-content'] = encodeURI(target);
        if (last) {
            toClientResponse.sendedToClient = true;
            addHeaderToResponse(res, toClientResponse.headers);
            await this.local.pipe({
                req,
                res,
                path: target,
                toClientResponse
            });
        } else {
            await this.local.cache({
                req,
                res,
                path: target,
                toClientResponse
            });
        }
    }
};