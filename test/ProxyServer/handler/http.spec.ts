import { expect } from "chai";
import http from "http";
import "mocha";
import { HttpHandler } from "../../../src/ProxyServer/impl";

describe("HttpHandler", () => {
    it("should invoke the middleware", (done) => {
        const s = http.createServer();
        const handler = new HttpHandler();
        handler.setMiddleware(async (ctx) => ctx.res.body = "hello world");
        s.on("request", handler.handle.bind(handler));
        s.listen(2018);
        const req = http.get("http://127.0.0.1:2018", (res) => {
            res.setEncoding("utf8");
            let rawData = "";
            res.on("data", (chunk) => { rawData += chunk; });
            res.on("end", () => {
                expect(rawData).to.equal("hello world");
                s.close();
                done();
            });
        });
    });
    it("should have a default middleware", (done) => {
        const s = http.createServer();
        const handler = new HttpHandler();
        s.on("request", handler.handle.bind(handler));
        s.listen(2018);
        const req = http.get("http://127.0.0.1:2018", (res) => {
            res.setEncoding("utf8");
            let rawData = "";
            res.on("data", (chunk) => { rawData += chunk; });
            res.on("end", () => {
                expect(rawData).to.equal("");
                s.close();
                done();
            });
        });
    });
});
