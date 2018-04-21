import { isString } from 'lodash';
import { LocalStorage } from 'node-localstorage';

const key = 'zanproxy-plugins';

export default class PluginStorage {
  private store: LocalStorage;
  constructor(path = __dirname) {
    this.store = new LocalStorage(path);
  }

  public set(value) {
    this.store.setItem(key, JSON.stringify(value));
  }

  public get() {
    let plugins = this.store.getItem(key) || [];
    if (isString(plugins)) {
      plugins = JSON.parse(plugins);
    }
    return plugins;
  }
}
