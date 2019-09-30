declare namespace ZanProxyMac {
  type IWorkspaceMeta =
    | {
        remote: false;
      }
    | {
        remote: true;
        url: string;
      };

  /**
   * 工作区对象
   */
  interface IWorkspace {
    /**
     * 唯一标识key
     */
    key: string;

    /**
     * 元信息，表示是否为远程规则
     */
    meta: IWorkspaceMeta;

    /**
     * 工作区名称
     */
    name: string;

    /**
     * 是否正在使用该工作区
     */
    checked: boolean;

    /**
     * 是否启用 host 代理
     */
    enableHost: boolean;

    /**
     * host 代理规则名称列表
     */
    hosts: string[];

    /**
     * 是否启用转发规则
     */
    enableRule: boolean;
    /**
     * 转发规则名称集
     */
    ruleSet: string[];
  }

  interface IExportOrImportData {
    workspace: IWorkspace;
  }

  interface IStorageStore {
    proxy_workspaces: ZanProxyMac.IWorkspace[];
  }

  interface IDataEventMap {
    'workspace:create': Partial<IWorkspace>;
    'workspace:activate': IWorkspace;
    'workspace:deactivate': IWorkspace;
    'workspace:update-list': IWorkspace[];
    'workspace:export': IExportOrImportData;
    'workspace:import': IExportOrImportData;
  }

  interface IEmptyEventMap {}

  interface IManagerGroup {
    workspace: void;
  }
}
