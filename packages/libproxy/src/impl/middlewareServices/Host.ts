import { Service, Inject } from 'typedi';
import { escapeRegExp } from 'lodash';
import LRU from 'lru-cache';
import dns from 'dns';

import {
  HostService as IHostService,
  HostServiceToken,
  Storage,
  HostStorageToken,
  HostRecord,
} from '../../service';

const ipReg = /((?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d))/;
const storageKey = '$HOST_FILES$';

@Service({
  id: HostServiceToken,
})
export class HostService implements IHostService {
  @Inject(HostStorageToken) storage: Storage;
  hostFiles: Array<HostRecord> = [];
  activeHosts = new Map<string, string>();
  cache: LRU.Cache<string, string>;

  constructor() {
    this.cache = LRU();
  }

  async init() {
    this.hostFiles = (await this.storage.get(storageKey)) || [];
    this.renewActiveHosts();
  }

  async resolveHost(hostname: string): Promise<string> {
    if (ipReg.test(hostname)) {
      return hostname;
    }
    if (this.activeHosts.has(hostname)) {
      return <string>this.activeHosts.get(hostname);
    }
    for (const [key, value] of this.activeHosts) {
      if (new RegExp(escapeRegExp(key).replace('*', '.?')).test(hostname)) {
        return value;
      }
    }
    if (this.cache.has(hostname)) {
      return <string>this.cache.get(hostname);
    }
    return new Promise<string>((resolve, reject) => {
      dns.lookup(hostname, 4, (err, addr) => {
        if (err) {
          reject(err);
        } else {
          resolve(addr);
        }
      });
    });
  }

  async createHostRecord(name, description, content?) {
    const f = this.getHostRecord(name);
    if (f) {
      throw new Error('Host file exists already');
    }
    const record: HostRecord = {
      meta: {
        local: true,
      },
      checked: false,
      name,
      description,
      content: content || [],
    };
    this.hostFiles.push(record);
    await this.onHostFilesChange();
    return record;
  }

  async deleteHostRecord(name: string) {
    const record = await this.getHostRecord(name);
    this.hostFiles = this.hostFiles.filter(hostFile => name !== hostFile.name);
    await this.onHostFilesChange();
    return record;
  }

  getHostRecord(name: string): HostRecord | undefined {
    return this.hostFiles.find(hostFile => name === hostFile.name);
  }

  async setUseHost(name) {
    const record = this.getHostRecord(name);
    this.hostFiles.forEach(hostFile => {
      if (hostFile.name === name) {
        hostFile.checked = true;
      } else {
        hostFile.checked = false;
      }
    });
    await this.onHostFilesChange();
    return record;
  }

  async saveHostRecord(name: string, content: HostRecord) {
    const record = this.getHostRecord(name);
    if (!record) {
      throw new Error('Host file not exist');
    }
    Object.assign(record, content);
    await this.onHostFilesChange();
    return record;
  }

  async onHostFilesChange() {
    await this.storage.set(storageKey, this.hostFiles);
    this.renewActiveHosts();
  }

  async getHostRecordList() {
    return this.hostFiles;
  }

  renewActiveHosts() {
    this.activeHosts = this.hostFiles
      .filter(hostFile => hostFile.checked)
      .map(hostFile => hostFile.content)
      .reduce((map, list) => {
        list.forEach(({ hostname, address }) => {
          map.set(hostname, address);
        });
        return map;
      }, new Map<string, string>());
  }
}
