import { isString } from 'lodash';
import { LocalStorage } from 'node-localstorage';

import { IPluginInfo } from './types';

const key = 'zanproxy-plugins';

export default class PluginStorage {
  private store: LocalStorage;

  constructor(path = __dirname) {
    this.store = new LocalStorage(path);
  }

  public set(value: IPluginInfo[]) {
    this.store.setItem(key, JSON.stringify(value));
  }

  public get(): IPluginInfo[] {
    let plugins = this.store.getItem(key) || [];
    if (isString(plugins)) {
      plugins = JSON.parse(plugins);
    }
    return plugins;
  }
}
