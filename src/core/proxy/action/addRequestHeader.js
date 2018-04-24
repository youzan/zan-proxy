const Action = require("./action");
const _ = require("lodash");
const cookie = require("cookie");

let addRequestHeader;
/**
 * 增加请求头
 */
module.exports = class AddRequestHeader extends Action {
    static getInstance() {
        if (!addRequestHeader) {
            addRequestHeader = new AddRequestHeader();
        }
        return addRequestHeader;
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
        if (_.lowerCase(action.data.headerKey) == "cookie") {
            let toAddCookie = cookie.parse(action.data.headerValue || "");
            Object.assign(additionalRequestCookies, toAddCookie);
        } else {
            additionalRequestHeaders[action.data.headerKey] = action.data.headerValue;
        }
    }
};