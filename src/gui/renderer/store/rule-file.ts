import { IRuleFile } from '@core/types/rule';
import { RULE_FILE_EVENTS } from '@gui/common/events';
import { ipcRenderer } from 'electron';
import { action, observable } from 'mobx';

export default class RuleFileStore {
  @observable ruleFiles: IRuleFile[] = [];

  constructor() {
    ipcRenderer.on(RULE_FILE_EVENTS.list, (e, ruleFiles: IRuleFile[]) => {
      this.setRuleFiles(ruleFiles);
    });

    ipcRenderer.send(RULE_FILE_EVENTS.fetch);
  }

  @action
  public setRuleFiles(ruleFiles: IRuleFile[]) {
    this.ruleFiles = ruleFiles;
  }
}
