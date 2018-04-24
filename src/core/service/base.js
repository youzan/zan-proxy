const EventEmitter = require("events");
module.exports = class BaseService extends EventEmitter {

    constructor() {
        super();
    }

    start(){
        throw new Error("not implement");
    }
}