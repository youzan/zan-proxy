const dns = require("dns");
const log = require("./log");
/**
 * node 调用getAddress会出问题
 * @param host
 * @returns {Promise}
 */
module.exports = class DnsResolver {
    constructor({ dnsCacheTime = 30000, timeout = 5000 }) {
        /**
         * {
                ip: ip,
                hostname: hostname,
                time: Date.now()
            }
         */
        this.dnsCache = {};
        this.TIMEOUT = timeout; // 解析超时时间
        this.CACHE_TIME = dnsCacheTime >= 0 ? dnsCacheTime : 30000;
        this.MAX_CACHE_TIME = Math.max(this.CACHE_TIME * 3, 600000);
    }

    async resovleIp(hostname, allowDnsCache = true) {
        let host = allowDnsCache ? this.dnsCache[hostname] : null;
        let cacheTime = 0;
        if (host) {
            cacheTime = Date.now() - host.time;
        }
        if (host && cacheTime < this.MAX_CACHE_TIME) {
            if (cacheTime > this.CACHE_TIME) {
                this.lookupDNSAndCache(host.hostname);
            }
            return host.ip;
        }
        let result = await this.lookupDNSAndCache(hostname);
        return result.ip;

    }

    lookupDNSAndCache(hostname) {
        return new Promise((resolve, reject) => {
            try {
                let done = false;
                let timer = setTimeout(() => {
                    if (done) return;
                    done = true;
                    reject(`dns resolve: ${hostname} timeout`);
                }, this.TIMEOUT);
                dns.lookup(hostname,  (err, ip, type) => {
                    clearTimeout(timer);
                    if (done) return;
                    done = true;
                    if (err) {
                        reject(err);
                    } else {
                        let result = {
                            ip: ip,
                            hostname: hostname,
                            time: Date.now()
                        };
                        this.dnsCache[hostname] = result;
                        resolve(result);
                    }
                });
            } catch (err) {//如果断网，可能直接抛异常
                if (done) return;
                done = true;
                reject(err);
            }
        });
    }
};