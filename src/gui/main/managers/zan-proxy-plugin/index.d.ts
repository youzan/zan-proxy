declare namespace ZanProxyMac {
  interface IPluginPkg {
    name: string;
    registry: string;
  }

  interface IDataEventMap {
    'zan-porxy-plugin.constructor:get-pre-install-plugins': IPluginPkg[];
  }

  interface IManagerGroup {
    'zan-proxy-plugin': void;
  }
}
