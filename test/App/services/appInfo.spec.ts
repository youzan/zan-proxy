import chai from "chai";
import ip from "ip";
import "mocha";
import path from "path";
import os from "os";
import { AppInfoService } from "./../../../src/App/services";

describe("AppInfoService", () => {
    const appInfo = new AppInfoService(false);
    it("should get the correct data directory", (done) => {
        appInfo.getProxyDataDir().should.equal(path.join(os.homedir(), ".front-end-proxy"));
        done();
    });
    it("should get the correct ip", (done) => {
        appInfo.getPcIp().should.equal(ip.address());
        done();
    });
    it("should set the info correctly", (done) => {
        appInfo.setAppInfo({
            realUiPort: 1234,
        });
        appInfo.getRealUiPort().should.equal(1234);
        done();
    });
    it("should set and get the proxy port correctly", (done) => {
        appInfo.setHttpProxyPort(2345);
        appInfo.getHttpProxyPort().should.equal(2345);
        done();
    });

    it("should judge webui request correctly", (done) => {
        appInfo.setRealUiPort(1234);
        appInfo.isWebUiRequest("127.0.0.1", 1234).should.be.true;
        appInfo.isWebUiRequest(ip.address(), 1234).should.be.true;
        done();
    });
});
