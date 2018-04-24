const AddRequestCookie = require("./addRequestCookie");
const AddRequestHeader = require("./addRequestHeader");
const AddResponseHeader = require("./addResponseHeader");
const Bypass = require("./bypass");
const MockData = require("./mockData");
const ModifyResponse = require("./modifyResponse");
const Redirect = require("./redirect");
const ScriptModifyResponse = require("./scriptModifyResponse");
const ScriptModifyRequest = require("./scriptModifyRequest");

/**
 * 按照处理实际分为三种类型的处理器
 * 1）修改请求
 * 2）获取响应内容
 * 3）修改响应内容
 */
let actionMap;
module.exports = class Action {
    /**
     * 获取所有的action名和 action 映射关系 map
     */
    static getActionMap() {
        if (!actionMap) {
            actionMap = {
                mockData: MockData.getInstance(),
                addRequestCookie: AddRequestCookie.getInstance(),
                addRequestHeader: AddRequestHeader.getInstance(),
                addResponseHeader: AddResponseHeader.getInstance(),
                modifyResponse: ModifyResponse.getInstance(),
                bypass: Bypass.getInstance(),
                redirect: Redirect.getInstance(),
                scriptModifyResponse: ScriptModifyResponse.getInstance(),
                scriptModifyRequest: ScriptModifyRequest.getInstance(),
            };
        }
        return actionMap;
    }

    static getAction(type) {
        return Action.getActionMap()[type];
    }

    static getBypassAction() {
        return Bypass.getInstance();
    }
}