import { expect } from "chai";
import http from "http";
import "mocha";
import { Forwarder } from "../../src/ProxyServer/impl";
import { Forwarder as IForwarder } from "../../src/ProxyServer/interfaces";

describe("Forwarder", () => {
    const forwarder: IForwarder = new Forwarder();
    it ("should not forward request if response body is specified", (done) => {
        const tempServer = http.createServer();
        tempServer.on("request", async (req, res) => {
            const ctx = {
                req, res,
            };
            res.body = "foo";
            const forwardRes = await forwarder.forward(ctx);
            expect(forwardRes).to.be.false;
            tempServer.close();
            res.end(res.body);
            done();
        });
        tempServer.listen(2018, () => {
            http.request("http://127.0.0.1:2018").end();
        });
    });

    it("should forward the request", (done) => {
        const tempServer = http.createServer();
        tempServer.on("request", async (req, res) => {
            const ctx = {
                req, res,
            };
            req.url = "http://127.0.0.1:2019";
            await forwarder.forward(ctx);
            res.body.pipe(res);
        });
        tempServer.listen(2018);

        const targetServer = http.createServer();
        targetServer.on("request", (req, res) => {
            let body = "";

            req.on("data", (data) => {
                body += data;
            });

            req.on("end", () => {
                expect(body).to.equal("hello world");
                targetServer.close();
                tempServer.close();
                res.end(body);
                done();
            });
        });
        targetServer.listen(2019);
        http.request({
            host: "127.0.0.1",
            method: "POST",
            port: 2018,
        }).end("hello world");
    });
});
