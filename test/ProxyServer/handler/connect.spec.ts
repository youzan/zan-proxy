import 'mocha';

import http from 'http';
import LRUCache from 'lru-cache';
import net from 'net';

import { ConnectHandler } from '../../../src/core/ProxyServer/impl';

describe("ConnectHandler", () => {
    const cache = new LRUCache<string, any>();
    const connectHandler = new ConnectHandler(2019, cache);
    const s = http.createServer();
    const ts = net.createServer();
    beforeEach(() => {
        s.listen(2018);
        ts.listen(2019);
    });
    it("should connect to the proxy port if request port is 443", (done) => {
        s.on("connect", connectHandler.handle.bind(connectHandler));
        const req = http.request({
            hostname: "127.0.0.1",
            method: "CONNECT",
            path: "www.example.com:443",
            port: 2018,
        });
        req.end();
        req.on("connect", () => {
            req.destroy(null);
            done();
        });
    });
    afterEach(() => {
        s.close();
        ts.close();
    });
});
