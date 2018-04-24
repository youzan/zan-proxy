
const _ = require("lodash");
module.exports = function addHeaderToResponse(response, headers) {
    _.forEach(headers,(value,key)=>{
        response.setHeader(key, value);
    })
}