import { ipcRenderer } from 'electron';
import { observable, action } from 'mobx';

import { RULE_FILE_EVENTS } from '@gui/common/events';

export default class RuleFileStore {
  @observable ruleFiles: ZanProxyMac.IHostFile[] = [];

  constructor() {
    ipcRenderer.on(RULE_FILE_EVENTS.list, (e, ruleFiles: ZanProxyMac.IHostFile[]) => {
      this.setRuleFiles(ruleFiles);
    });

    ipcRenderer.send(RULE_FILE_EVENTS.fetch);
  }

  @action
  public setRuleFiles(ruleFiles: ZanProxyMac.IHostFile[]) {
    this.ruleFiles = ruleFiles;
  }
}
