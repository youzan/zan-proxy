import chai from "chai";
import fs from "fs";
import "mocha";
import path from "path";
import os from "os";
import rimraf from "rimraf";
import { AppInfoService, HostService } from "./../../../src/App/services";

describe("HostService", () => {
    const appInfoService = new AppInfoService();
    let hostService: HostService = null;
    before(() => {
        if (!fs.existsSync(os.homedir())) {
            fs.mkdirSync(os.homedir());
        }
        const dataDir = path.join(os.homedir(), ".front-end-proxy");
        fs.mkdirSync(dataDir);
        const dir = path.join(dataDir, "host");
        fs.mkdirSync(dir);
        const resetHost = {
            checked: true,
            content: {
                "*.youzan.com": "127.0.0.1",
            },
            description: "test hosts",
            meta: {
              local: true,
            },
            name: "test",
        };
        fs.writeFileSync(path.join(dir, "root_test.json"), JSON.stringify(resetHost), { encoding: "utf-8" });
        hostService = new HostService(appInfoService);
    });
    after(() => rimraf.sync(os.homedir()));
    it("should get the host file", async () => {
        hostService.getHostFile("root", "test").should.not.be.undefined;
    });

    it("should resolve the host correctly", async () => {
        const resolved = await hostService.resolveHost("root", "test.youzan.com");
        resolved.should.equal("127.0.0.1");
    });

    it("should not resolve an unknown host", async () => {
        const resolved = await hostService.resolveHost("root", "myfoo.com");
        resolved.should.equal("myfoo.com");
    });

    it("should get the host file list", (done) => {
        hostService.getHostFileList("root").should.not.empty;
        done();
    });

    it("should create a host file successfully", async () => {
        await hostService.createHostFile("root", "test2", "mytest");
        const filePath = path.join(os.homedir(), ".front-end-proxy/host/root_test2.json");
        const f = hostService.getHostFile("root", "test2");
        f.should.not.be.undefined;
        fs.existsSync(filePath).should.be.true;
        rimraf.sync(filePath);
    });

    it("should delete a host file successfully", async () => {
        await hostService.createHostFile("root", "test2", "mytest");
        await hostService.deleteHostFile("root", "test2");
        const filePath = path.join(os.homedir(), ".front-end-proxy/host/root_test2.json");
        fs.existsSync(filePath).should.be.false;
        rimraf.sync(filePath);
    });

    it("should save a host file successfully", async () => {
        await hostService.createHostFile("root", "test2", "mytest");
        await hostService.saveHostFile("root", "test2", {
            checked: false,
            content: {
                "test.zanproxy.com": "127.0.0.1",
            },
            description: "test hosts",
            meta: {
                local: true,
            },
            name: "test2",
        });
        const hostfile = hostService.getHostFile("root", "test2");
        Object.keys(hostfile.content).should.includes("test.zanproxy.com");
        await hostService.deleteHostFile("root", "test2");
    });

    it("should select the the correct host file to resolve", async () => {
        await hostService.createHostFile("root", "test2", "mytest");
        await hostService.saveHostFile("root", "test2", {
            checked: false,
            content: {
                "*.youzan.com": "192.168.1.1",
            },
            description: "test hosts",
            meta: {
                local: true,
            },
            name: "test2",
        });
        await hostService.toggleUseHost("root", "test2");
        const address = await hostService.resolveHost("root", "test.youzan.com");
        address.should.equal("192.168.1.1");
        await hostService.deleteHostFile("root", "test2");
    });
});
