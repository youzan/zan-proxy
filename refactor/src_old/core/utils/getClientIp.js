const ConnectHandle = require("../proxy/handle/connectHandle");

module.exports = function (req) {
    if (req.connection.encrypted) {
        let remotePort = req.connection.remotePort;
        let ip = ConnectHandle.getProxyRequestPortMapedClientIp(remotePort);
        if (ip) return ip;
    }
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}