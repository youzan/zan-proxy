const util = require('util');
exports.setError = function setError(toClientResponse, msg = "", error) {
    toClientResponse.statusCode = 600;
    toClientResponse.hasContent = true;
    toClientResponse.stopRunAction = true;
    // pipe类型的响应 sendedToClient为true
    toClientResponse.sendedToClient = false;
    toClientResponse.body = msg + "\n\n" + util.inspect(toClientResponse.headers) + "\n\n" + (error && error.message || "") + "\n\n" + error && util.inspect(error);
};