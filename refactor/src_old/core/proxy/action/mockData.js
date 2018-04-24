/**
 * Created by tsxuehu on 17/3/19.
 */
const Action = require("./action");
const ServiceRegistry = require("../../service");
const sendSpecificToClient = require("../../utils/sendSpecificToClient");
const addHeaderToResponse = require("../../utils/addHeaderToResponse");

let mockData;
module.exports = class MockData extends Action {
    static getInstance() {
        if (!mockData) {
            mockData = new MockData();
        }
        return mockData;
    }

    constructor() {
        super();
        this.mockDataService = ServiceRegistry.getMockDataService();
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
        // 获取数据文件id
        let dataId = action.data.dataId;
        let content = await this.mockDataService.getDataFileContent(userId, dataId);
        let contentType = await this.mockDataService.getDataFileContentType(userId, dataId);
        toClientResponse.headers['fe-proxy-content'] = `mock data ${dataId}`;
        toClientResponse.headers['Content-Type'] = contentType;
        if (last) {
            toClientResponse.hasContent = true;
            toClientResponse.body = content;
        } else {
            toClientResponse.hasContent = true;
            toClientResponse.body = content;
        }

    }
}