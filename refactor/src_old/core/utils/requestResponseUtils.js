const queryString = require("query-string");
const _ = require("lodash");
const zlib = require('zlib');

//获取请求body 同一个请求，返回同一个Promise
function getClientRequestBody(req) {

    if (req.proxyFetchDataPromise) {
        return req.proxyFetchDataPromise;
    }

    let resolve = _.noop;
    let reject = _.noop;
    let promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    let method = req.method.toLowerCase();
    if (['post', 'put', 'patch'].indexOf(method) > -1) {
        let stream = req;

        let requestBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
            requestBuffer.push(chunk);
        });

        stream.on('error', function handleStreamError(err) {
            reject(err);
        });

        stream.on('end', function handleStreamEnd() {
            let requestData = Buffer.concat(requestBuffer);
            resolve(requestData);
        });
    } else {
        resolve("");
    }

    req.proxyFetchDataPromise = promise;
    return req.proxyFetchDataPromise;
}

// 获取请求的content type
function getContentType(request) {
    let headers = request.headers;
    let contentType = headers['content-type'];
    if (!contentType) {
        return;
    }
    if (Array.isArray(contentType)) {
        contentType = contentType[0];
    }
    const index = contentType.indexOf(';');
    return index > -1 ? contentType.substr(0, index) : contentType;
}

// 获取请求内容
// 从_getRequestBody返回的 body 组装请求内容
async function getClientRequestContent(req, urlObj) {
    let bodyBuffer = await getClientRequestBody(req);
    let body = bodyBuffer;
    /* let type = getContentType(req);
     if (type && ['application/json', 'application/x-www-form-urlencoded', 'text/plain', 'text/html'].indexOf(type) > -1) {
     body = bodyBuffer.toString('utf8');
     }*/
    let { protocol, hostname, href, pathname, port } = urlObj;
    let query = queryString.parse(urlObj.search);
    return {
        hasContent: true,
        protocol, // 请求协议
        method: req.method, // 请求方法
        hostname, // 请求域名
        pathname: pathname, // 路径
        query, // query对象
        port, // 端口号
        headers: _.assign({}, req.headers), // 请求头
        body // 请求body
    };
}

// 获取返回给client的内容
// 原理：两个流pipe时有pipe事件，监听输入流上的数据
function getServerResponseBody(res) {
    if (res.proxyServerContentPromise) {
        return res.proxyServerContentPromise;
    }
    // todo 换一种方式实现，集中获取，然后解压
    let resolve = _.noop;
    let reject = _.noop;
    let promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    let stream = res;
    switch (res.headers['content-encoding']) {
        case 'gzip':
        case 'compress':
        case 'deflate':
            stream = stream.pipe(zlib.createUnzip());
            break;
    }

    let responseBuffer = [];
    stream.on('data', function handleStreamData(chunk) {
        responseBuffer.push(chunk);
    });

    stream.on('error', function handleStreamError(err) {
        console.log('stream err', err);
        reject(err);
    });

    stream.on('end', function handleStreamEnd() {
        let responseData = Buffer.concat(responseBuffer);
        // responseData = responseData.toString('utf8');
        resolve(responseData);
    });

    res.proxyServerContentPromise = promise;
    return res.proxyServerContentPromise;
}

module.exports = {
    getClientRequestBody, getClientRequestContent, getServerResponseBody
};