import Container from 'typedi';

import { RuleService } from './services';

/**
 * 同步远程转发规则
 */
const syncRemoteRules = async () => {
  console.log('开始同步远程规则集');
  const ruleService = Container.get(RuleService);
  const userRuleFiles = ruleService.getRuleFileList();
  for (const ruleFile of userRuleFiles) {
    if (!ruleFile.meta || !ruleFile.meta.remote || !ruleFile.meta.url) {
      continue;
    }
    console.info(`同步规则集${ruleFile.name}中`);
    try {
      await ruleService.importRemoteRuleFile(ruleFile.meta.url as string);
      console.info(`同步规则集${ruleFile.name}成功`);
    } catch (e) {
      console.error(`同步规则集${ruleFile.name}失败`);
    }
  }
  console.log('同步远程规则集结束');
};

export default syncRemoteRules;
