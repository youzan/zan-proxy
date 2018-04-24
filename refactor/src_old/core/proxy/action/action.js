module.exports = class Action {

    /**
     * 动作运行是否需要浏览器的请求内容
     */
    needRequestContent() {
        throw new Error("not implement");
    }

    /**
     * 动作运行是否需要服务器端的返回内容
     */
    needResponse() {
        throw new Error("not implement");
    }

    /**
     * 执行此动作是否获取内容
     * 指示性flag，减少不必要的action执行
     * @returns {boolean}
     */
    willGetContent() {
        throw new Error("not implement");
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
                  rule, // 规则
                  action, // 规则里的一个动作
                  requestContent, // 请求内容 , 动作使用这个参数 需要让needRequestContent函数返回true
                  additionalRequestHeaders, // 请求头
                  actualRequestHeaders,
                  additionalRequestCookies, // cookie
                  actualRequestCookies,
                  toClientResponse, //响应内容,  动作使用这个参数 需要让needResponse函数返回true
                  last = true
              }) {
        throw new Error("not implement");
    }
}