declare namespace ZanProxyMac {
  import { IHostFile } from '@core/types/host';
  import { IRuleFile } from '@core/types/rule';

  interface IExportOrImportData {
    hostFiles?: IHostFile[];
    ruleFiles?: IRuleFile[];
  }

  interface IDataEventMap {
    'host-and-rule-files:update-host': IHostFile[];
    'host-and-rule-files:update-rule': IRuleFile[];
  }

  interface IManagerGroup {
    'host-and-rule-files': void;
  }
}
