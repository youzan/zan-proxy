import Container from 'typedi';

import { HostService, ProfileService, RuleService } from '@core/services';

const workspaceManagerHelper = {
  /**
   * 激活工作区
   *
   * @returns
   * @memberof Workspace
   */
  async activateWorkspace(this: void, ws: ZanProxyMac.IWorkspace) {
    const hostService = Container.get(HostService);
    const ruleService = Container.get(RuleService);
    const profileService = Container.get(ProfileService);

    await profileService.setEnableHost(ws.enableHost);
    await profileService.setEnableRule(ws.enableRule);

    // 设置host
    if (ws.enableHost) {
      const allHosts = hostService.getHostFileList();
      for (const hostFile of allHosts) {
        const hostFileName = hostFile.name;
        const shouldBeUsed = ws.hosts.includes(hostFileName);
        if (shouldBeUsed && !hostFile.checked) {
          // 需要被使用却还未启用的
          await hostService.toggleHost(hostFileName, true);
        } else if (!shouldBeUsed && hostFile.checked) {
          // 不需要被使用却已启用的
          await hostService.toggleHost(hostFileName, false);
        }
      }
    }

    // 设置转发规则
    if (ws.enableRule) {
      const allRules = ruleService.rules || {};
      const ruleSetNames = Object.keys(allRules);
      for (const ruleSetName of ruleSetNames) {
        const ruleSetActivate = ws.ruleSet.filter(rs => rs === ruleSetName).length > 0;
        await ruleService.toggleRuleFile(ruleSetName, ruleSetActivate);
      }
    }
  },

  /**
   * 关闭工作区
   *
   * @param {void} this
   * @param {IWorkspace} ws
   */
  async deactivateWorkspace(this: void, ws: ZanProxyMac.IWorkspace) {
    const profileService = Container.get(ProfileService);
    await profileService.setEnableHost(false);
    await profileService.setEnableRule(false);
  },
};

export default workspaceManagerHelper;
