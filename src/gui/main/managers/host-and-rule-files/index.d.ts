declare namespace ZanProxyMac {
  interface IHostFile {
    name: string;
    description: string;
    meta:
      | {
          local: true; // 是否为本地配置
        }
      | {
          local: false;
          url: string;
        };
    checked: boolean;
  }

  interface IRuleFile {
    name: string;
    description: string;
    meta: {
      ETag: string;
      remoteETag: string;
      isCopy?: boolean;
    } & (
      | {
          remote: true; // 是否为远程配置文件
          url: string;
        }
      | {
          remote: false;
        });
    checked: boolean;
  }

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
