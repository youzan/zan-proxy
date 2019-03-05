declare namespace ZanProxyMac {
  interface IState {
    value: number;
    text: string;
  }

  interface IPorts {
    proxyPort: number;
    managerPort: number;
  }

  interface IStorageStore {
    ports: IPorts;
  }

  interface IDataEventMap {
    'app-data:update-state': IState;
  }

  interface IManagerGroup {
    'app-data': void;
  }
}
