declare namespace ZanProxyMac {
  import { MenuItemConstructorOptions } from 'electron';

  interface IEmptyEventMap {
    'tray:render': void;
  }

  interface IDataEventMap {
    'tray:get-options': MenuItemConstructorOptions[];
  }

  interface IManagerGroup {
    tray: void;
  }
}
