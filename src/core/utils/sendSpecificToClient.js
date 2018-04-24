/**
 * Created by tsxuehu on 17/3/31.
 */
// 向客户端返回置顶内容
const _ = require("lodash");

module.exports = function ({ res, statusCode, headers, content }) {
    res.statusCode = statusCode || 200;

    let buffer = null;
    if (Buffer.isBuffer(content)) {
        buffer = content;
    } else {
        buffer = Buffer.from(content, 'utf-8');
    }

    headers['content-length'] = buffer.length;
    _.forEach(headers, function (value, key) {
        res.setHeader(key, value);
    });

    res.end(buffer);
};