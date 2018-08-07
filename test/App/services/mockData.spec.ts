import chai from "chai";
import fs from "fs";
import "mocha";
import path from "path";
import os from "os";
import rimraf from "rimraf";
import uuid from "uuid/v4";

import { AppInfoService, MockDataService } from "../../../src/App/services";

describe("MockDataService", () => {
    const appInfoService = new AppInfoService();
    let mockDataService: MockDataService = null;
    const dataID = uuid();
    before(() => {
        if (!fs.existsSync(os.homedir())) {
            fs.mkdirSync(os.homedir());
        }
        const dataDir = path.join(os.homedir(), ".front-end-proxy");
        fs.mkdirSync(dataDir);
        const listDir = path.join(dataDir, "mock-list");
        fs.mkdirSync(listDir);
        const resetList = [{
            contenttype: "application/json",
            id: dataID,
            name: "test",
        }];
        fs.writeFileSync(path.join(listDir, "root.json"), JSON.stringify(resetList), { encoding: "utf-8" });
        const dir = path.join(dataDir, "mock-data");
        fs.mkdirSync(dir);
        fs.writeFileSync(path.join(dir,
            `root_${resetList[0].id}`),
            JSON.stringify({blabla: "blabla"}),
            { encoding: "utf-8" });
        mockDataService = new MockDataService(appInfoService);
    });
    after(() => rimraf.sync(os.homedir()));

    it("should get the content type correctly", async () => {
        const ct = await mockDataService.getDataFileContentType("root", dataID);
        ct.should.includes("application/json");
    });

    it("should get the mock data list", (done) => {
        mockDataService.getMockDataList("root").should.not.be.empty;
        done();
    });
    it ("should get the data file content correctly", async () => {
        const content = await mockDataService.getDataFileContent("root", dataID);
        content.should.includes("blabla");
    });
});
