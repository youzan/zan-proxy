const Action = require("./action");
const _ = require("lodash");
const cookie = require("cookie");

let addResponseHeader;
/**
 * 增加请求头
 */
module.exports = class AddResponseHeader extends Action {
    static getInstance() {
        if (!addResponseHeader) {
            addResponseHeader = new AddResponseHeader();
        }
        return addResponseHeader;
    }

    needRequestContent() {
        return false;
    }

    needResponse() {
        return false;
    }

    willGetContent() {
        return false;
    }

    /**
     * 运行处理动作
     */
    async run({
                  req,
                  res,
                  urlObj,
                  clientIp,
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
        toClientResponse.headers[action.data.headerKey] = action.data.headerValue;
    }
};