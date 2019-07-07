import ora from 'ora';
import Container from 'typedi';

import { RuleService } from './services';
import { IRuleFile } from './types/rule';

const userId = 'root';

/**
 * 同步远程转发规则
 */
const syncRemoteRules = async () => {
  console.log('开始同步远程规则集');
  const ruleService = Container.get(RuleService);
  const userRuleFilesMap = ruleService.getRuleFileList();
  const userRuleFiles: IRuleFile[] = Object.values(userRuleFilesMap);
  for (const ruleFile of userRuleFiles) {
    if (ruleFile.meta && ruleFile.meta.remote === true) {
      const spinner = ora(`同步规则集${ruleFile.name}中`).start();
      try {
        await ruleService.importRemoteRuleFile(ruleFile.meta.url as string);
        spinner.succeed(`同步规则集${ruleFile.name}成功`);
      } catch (e) {
        spinner.fail(`同步规则集${ruleFile.name}失败`);
      }
    }
  }
  console.log('同步远程规则集结束');
};

export default syncRemoteRules;
