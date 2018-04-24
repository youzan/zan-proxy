const Action = require("./action");

const cookie = require("cookie");
const _ = require("lodash");

let addRequestCookie;
module.exports = class AddRequestCookie extends Action {
    static getInstance() {
        if (!addRequestCookie) {
            addRequestCookie = new AddRequestCookie();
        }
        return addRequestCookie;
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
        additionalRequestHeaders[action.data.cookieKey] = action.data.cookieValue;


    }
}