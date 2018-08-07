import chai from "chai";
import fs from "fs";
import "mocha";
import path from "path";
import os from "os";
import rimraf from "rimraf";
import URL from "url";
import { AppInfoService, RuleFile, RuleService } from "../../../src/App/services";

const should = chai.should();

describe("RuleService", () => {
    const appInfoService = new AppInfoService();
    let ruleService: RuleService = null;
    before(() => {
        if (!fs.existsSync(os.homedir())) {
            fs.mkdirSync(os.homedir());
        }
        const dataDir = path.join(os.homedir(), ".front-end-proxy");
        fs.mkdirSync(dataDir);
        const dir = path.join(dataDir, "rule");
        fs.mkdirSync(dir);
        const resetRule: RuleFile = {
            checked: true,
            content: [
                {
                    actionList: [
                        {
                            data: {
                                dataId: "",
                                headerKey: "",
                                headerValue: "",
                                target: "/test",
                            },
                            type: "redirect",
                        },
                    ],
                    checked: true,
                    key: "e3443c60-9765-4f07-bade-63674a9721a2",
                    match: "www.youzan.com",
                    method: "",
                    name: "",
                },
            ],
            description: "转发到本地",
            meta: {
                ETag: "",
                remote: false,
                remoteETag: "",
                url: "",
            },
            name: "test",
        };
        fs.writeFileSync(path.join(dir, "root_test.json"), JSON.stringify(resetRule), { encoding: "utf-8" });
        ruleService = new RuleService(appInfoService);
    });
    after(() => rimraf.sync(os.homedir()));

    it("should get the correct rule file list", (done) => {
        ruleService.getRuleFileList("root").should.not.empty;
        done();
    });

    it("should get the correct rule to process", (done) => {
        const rule = ruleService.getProcessRule("root", "GET", URL.parse("http://www.youzan.com"));
        rule.should.exist;
        done();
    });

    it("should create a create rule file correctly", async () => {
        await ruleService.createRuleFile("root", "test2", "description");
        ruleService.getRuleFileList("root").length.should.gt(1);
        await ruleService.deleteRuleFile("root", "test2");
    });

    it("should delete the rule file correctly", async () => {
        await ruleService.createRuleFile("root", "test2", "description");
        await ruleService.deleteRuleFile("root", "test2");
        ruleService.getRuleFileList("root").length.should.lt(2);
    });

    it("should disable a rule file", async () => {
        await ruleService.setRuleFileCheckStatus("root", "test", false);
        const rule = ruleService.getProcessRule("root", "GET", URL.parse("http://www.youzan.com"));
        should.not.exist(rule);
    });
});
