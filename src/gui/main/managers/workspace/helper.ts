import Container from 'typedi';

import { HostService, ProfileService, RuleService } from 'zan-proxy/dist/App/services';

const workspaceManagerHelper = {
  /**
   * 激活工作区
   *
   * @returns
   * @memberof Workspace
   */
  async activateWorkspace(this: void, ws: ZanProxyMac.IWorkspace) {
    const hostService = Container.get<any>(HostService);
    const ruleService = Container.get<any>(RuleService);
    const profileService = Container.get<any>(ProfileService);

    await profileService.setEnableHost('root', ws.enableHost);
    await profileService.setEnableRule('root', ws.enableRule);

    // 设置host
    if (ws.enableHost) {
      const allHosts = hostService.userHostFilesMap.root || {};
      const hostFileNames = Object.keys(allHosts);
      for (const hostFileName of hostFileNames) {
        const hostFile = allHosts[hostFileName];
        const shouldBeUsed = ws.hosts.includes(hostFileName);
        if (shouldBeUsed && !hostFile.checked) {
          // 需要被使用却还未启用的
          await hostService.toggleUseHost('root', hostFileName);
        } else if (!shouldBeUsed && hostFile.checked) {
          // 不需要被使用却已启用的
          await hostService.toggleUseHost('root', hostFileName);
        }
      }
    }

    // 设置转发规则
    if (ws.enableRule) {
      const allRules = (ruleService.rules && ruleService.rules.root) || {};
      const ruleSetNames = Object.keys(allRules);
      for (const ruleSetName of ruleSetNames) {
        const ruleSetActivate = ws.ruleSet.filter(rs => rs === ruleSetName).length > 0;
        await ruleService.setRuleFileCheckStatus('root', ruleSetName, ruleSetActivate);
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
    const profileService = Container.get<any>(ProfileService);
    await profileService.setEnableHost('root', false);
    await profileService.setEnableRule('root', false);
    ws.checked = false;
  },
};

export default workspaceManagerHelper;
