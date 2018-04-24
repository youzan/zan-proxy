const _ = require("lodash");

module.exports = function (cookies) {
    let arr = [];
    _.forEach(cookies, (value, key) => {
        key = encodeURIComponent(String(key));
        key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
        key = key.replace(/[\(\)]/g, escape);

        value = encodeURIComponent(String(value))
            .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

        arr.push(`${key}=${value}`);
    });

    return arr.join("; ");
};