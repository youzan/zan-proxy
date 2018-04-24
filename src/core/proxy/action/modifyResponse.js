const Action = require( "./action");
const queryString = require( "query-string");
const _ = require( "lodash");

let modifyResponse;
module.exports = class ModifyResponse extends Action {
    static getInstance() {
        if (!modifyResponse) {
            modifyResponse = new ModifyResponse();
        }
        return modifyResponse;
    }

    needRequestContent() {
        return false;
    }

    needResponse() {
        return true;
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

        if (action.data.modifyResponseType == 'addTimestampToJsCss') {

            toClientResponse.body = addTimestampToJsCss(body);

        } else if (action.data.modifyResponseType == "returnDataInJsonpStyle") {

            // jsonp请求 替换callback
            let parsed = queryString.parse(urlObj.search);
            let cbName = parsed[action.data.callbackName];
            toClientResponse.body = `${cbName}(${body})`;
            toClientResponse.headers['Content-Type'] = 'application/javascript;charset=utf-8';

        } else if (action.data.modifyResponseType == "allowCros") {
            // todo 存在问题
            // req.headers.origin || ''
            toClientResponse.headers['Access-Control-Allow-Origin'] = '*';
            // toClientResponse.headers['Vary'] =  'Origin';
            toClientResponse.headers['Access-Control-Allow-Credentials'] = true;
            toClientResponse.headers['Access-Control-Allow-Methods'] = req.headers['Access-Control-Request-Method'] || '';
            toClientResponse.headers['Access-Control-Allow-Headers'] = req.headers['Access-Control-Request-Headers'] || '';
            let method = req.method;
            if (_.lowerCase(method) == 'option') {
                toClientResponse.headers['Access-Control-Max-Age'] = 86400;
            }

        } else if (action.data.modifyResponseType == "return404") {

            toClientResponse.hasContent = true;
            toClientResponse.statusCode = 404;
            toClientResponse.body = 'user want';

        }
    }
}


// =============  js css请求加时间戳
var hrefReg = /href=['"].*?['"]/gi;
var srcReg = /src=['"].*?['"]/gi;
function addTimestampToJsCss(body) {
    //<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700,400italic">
    //<script async="async" crossorigin="anonymous"  src="https://assets-cdn.github.com/assets/60.js">
    var timestamp = Date.now();
    body = body.replace(/<script .*?>|<link .*?>/gi, element => {
        // 对script src属性进行处理
        var isLink = element.startsWith('<link');
        var toReplace = addTimestampToElement(element, isLink ? hrefReg : srcReg, timestamp);
        return toReplace;
    });
    return body;
}

function addTimestampToElement(element, reg, timestamp) {
    return element.replace(reg, url => {
        var isDouble = url.indexOf('"') > -1;
        var hasWenhao = url.indexOf('?') > -1;
        return `${url.substring(0, url.length - 1)}${hasWenhao ? '&' : '?'}proxyts=${timestamp}${isDouble ? '"' : "'" }`;
    })
}
