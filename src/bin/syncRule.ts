import ora from 'ora';
import { AppInfoService, RuleFile, RuleService } from './../App/services';

const syncRemoteRules = async () => {
  console.log('开始同步远程规则集');
  const appInfoService = new AppInfoService(false);
  const ruleService = new RuleService(appInfoService);
  const userIDs = Object.keys(ruleService.rules);
  for (const userID of userIDs) {
    const userRuleFilesMap = ruleService.rules[userID];
    const userRuleFiles: RuleFile[] = Object.keys(userRuleFilesMap).map(
      k => userRuleFilesMap[k],
    );
    for (const ruleFile of userRuleFiles) {
      if (ruleFile.meta && ruleFile.meta.remote && !ruleFile.disableSync) {
        const spinner = ora(`同步规则集${ruleFile.name}`).start();
        try {
          await ruleService.importRemoteRuleFile(userID, ruleFile.meta.url);
          spinner.succeed();
        } catch (e) {
          spinner.fail();
        }
      }
    }
  }
  console.log('同步远程规则集结束');
};

export default syncRemoteRules;
