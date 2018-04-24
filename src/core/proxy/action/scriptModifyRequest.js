const Action = require("./action");
const vm = require('vm');
/**
 * 自定义js脚本修改请求内容
 */
let scriptModifyRequest;

module.exports = class ScriptModifyRequest extends Action {

    static getInstance() {
        if (!scriptModifyRequest) {
            scriptModifyRequest = new ScriptModifyRequest();
        }
        return scriptModifyRequest;
    }

    needRequestContent() {
        return true;
    }

    needResponse() {
        return false;
    }

    willGetContent() {
        return false;
    }

    async run({
                  req,
                  res,
                  urlObj,
                  clientIp,
                  rule, // 规则
                  action, // 规则里的一个动作
                  requestContent, // 原始内容
                  additionalRequestHeaders, // 请求头
                  actualRequestHeaders,
                  additionalRequestCookies, // cookie
                  actualRequestCookies,
                  toClientResponse, //响应内容
                  last = true
              }) {
        const sandbox = {
            clientIp,
            requestContent, // 请求内容
            additionalRequestHeaders,// 请求附加头
            additionalRequestCookies,// 请求附加cookie
            toClientResponse, // 记录返回给浏览器的信息
            console
        };
        try {
            vm.runInNewContext(action.data.modifyRequestScript, sandbox);
        } catch (e) {
            toClientResponse.headers['fe-proxy-error'] = encodeURI(e.message);
        }

    }
};