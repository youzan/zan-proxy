import EventEmitter from 'events';
import fs from 'fs-extra';
import { find, forEach, get } from 'lodash';
import fetch from 'node-fetch';
import path from 'path';
import { Service } from 'typedi';

import { IHostFile } from '@core/types/host';

import { AppInfoService } from './appInfo';

const IP_REG = /((?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d))/;

interface IHostMap {
  globHostMap: { [host: string]: string };
  hostMap: { [host: string]: string };
}

/**
 * Created by tsxuehu on 8/3/17.
 */
@Service()
export class HostService extends EventEmitter {
  private userHostFilesMap: {
    [user: string]: {
      [fileName: string]: IHostFile;
    };
  };
  private inUsingHostsMapCache: {
    [user: string]: IHostMap;
  };
  private hostSaveDir: string;
  constructor(appInfoService: AppInfoService) {
    super();
    // userId -> { filename -> content}
    this.userHostFilesMap = {};
    // 缓存
    // userId, {globHostMap, hostMap}
    this.inUsingHostsMapCache = {};
    const proxyDataDir = appInfoService.proxyDataDir;
    this.hostSaveDir = path.join(proxyDataDir, 'host');

    const contentMap = fs
      .readdirSync(this.hostSaveDir)
      .filter(name => name.endsWith('.json'))
      .reduce((prev, curr) => {
        try {
          prev[curr] = fs.readJsonSync(path.join(this.hostSaveDir, curr));
        } catch (e) {
          // ignore
        }
        return prev;
      }, {});
    forEach(contentMap, (content, fileName) => {
      // @ts-ignore
      const hostName = content.name;
      const userId = fileName.substr(0, this._getUserIdLength(fileName, hostName));
      this.userHostFilesMap[userId] = this.userHostFilesMap[userId] || {};
      this.userHostFilesMap[userId][hostName] = content;
    });
  }

  public resolveHost(hostname: string): string {
    if (!hostname) {
      return hostname;
    }

    // 访问 ip 地址时，不做 host 解析
    if (IP_REG.test(hostname)) {
      return hostname;
    }

    let ip: string;
    const inUsingHosts = this.getInUsingHosts('root');
    ip = inUsingHosts.hostMap[hostname];
    if (ip) {
      return ip;
    }
    // 配置 *开头的host  计算属性globHostMap已经将*去除
    ip = find(inUsingHosts.globHostMap, (_, host) => {
      return hostname.endsWith(host);
    });
    if (ip) {
      return ip;
    }
    return hostname;
  }

  /**
   * 获取用户的host文件列表
   */
  public getHostFileList(userId: string) {
    return Object.values(this.userHostFilesMap[userId]);
  }

  /**
   * 创建host文件
   * @param userId
   * @param name
   * @param description
   * @returns {boolean}
   */
  public async createHostFile(userId, name, description) {
    if (this.userHostFilesMap[userId] && this.userHostFilesMap[userId][name]) {
      // 文件已经存在不让创建
      return false;
    }

    const content: IHostFile = {
      checked: false,
      content: {},
      description,
      meta: {
        local: true,
      },
      name,
    };
    this.userHostFilesMap[userId] = this.userHostFilesMap[userId] || {};
    this.userHostFilesMap[userId][name] = content;

    const hostfileName = this._getHostFilePath(userId, name);
    await fs.writeJson(hostfileName, content, { encoding: 'utf-8' });
    this.emit('data-change', userId, this.getHostFileList(userId));
    this.emit('host-saved', userId, name, content);
    return true;
  }

  public async deleteHostFile(userId, name) {
    delete this.userHostFilesMap[userId][name];
    delete this.inUsingHostsMapCache[userId];
    /**
     * 删除文件
     */
    const filePath = this._getHostFilePath(userId, name);
    const exists = await fs.pathExists(filePath);
    if (exists) {
      await fs.remove(filePath);
    }
    this.emit('data-change', userId, this.getHostFileList(userId));
    this.emit('host-deleted', userId, name);
  }

  public async toggleUseHost(userId, filename) {
    const toSaveFileName: string[] = [];
    forEach(this.userHostFilesMap[userId], (content, name) => {
      if (content.name === filename) {
        content.checked = !content.checked;
        toSaveFileName.push(name);
      }
    });
    // 保存文件
    for (const name of toSaveFileName) {
      const hostfileName = this._getHostFilePath(userId, name);
      const content = this.userHostFilesMap[userId][name];
      await fs.writeJson(hostfileName, content, { encoding: 'utf-8' });
    }
    delete this.inUsingHostsMapCache[userId];
    this.emit('data-change', userId, this.getHostFileList(userId));
  }

  public getHostFile(userId: string, name: string): IHostFile | undefined {
    return get(this.userHostFilesMap, [userId, name]);
  }

  public async saveHostFile(userId, name, content) {
    if (!this.userHostFilesMap[userId]) {
      this.userHostFilesMap[userId] = {};
    }
    this.userHostFilesMap[userId][name] = content;

    // 如果正在使用，则删除
    if (content.checked) {
      delete this.inUsingHostsMapCache[userId];
    }

    const hostfileName = this._getHostFilePath(userId, name);
    await fs.writeJson(hostfileName, content, { encoding: 'utf-8' });
    this.emit('host-saved', userId, name, content);
    this.emit('data-change', userId, this.getHostFileList(userId));
  }

  public async importRemoteHostFile(userId: string, url: string) {
    const resp = await fetch(url);
    const f = await resp.json();
    f.meta = {
      local: false,
      url,
    };
    if (!f.content) {
      f.content = {};
    }
    if (!f.name) {
      f.name = url.split('/').slice(-1)[0] || url;
    }
    if (this.getHostFile(userId, f.name) && this.getHostFile(userId, f.name).checked) {
      f.checked = true;
    } else {
      f.checked = false;
    }
    return this.saveHostFile(userId, f.name, f);
  }

  private _getHostFilePath(userId, hostName) {
    const fileName = `${userId}_${hostName}.json`;
    const filePath = path.join(this.hostSaveDir, fileName);
    return filePath;
  }

  private _getUserIdLength(ruleFileName, hostName) {
    return ruleFileName.length - hostName.length - 6;
  }

  /**
   * 获取用户生效的host
   * @param userId
   * @returns {*}
   */
  private getInUsingHosts(userId) {
    let hosts = this.inUsingHostsMapCache[userId];
    if (!hosts) {
      // 读文件加载host
      const hostMap = {};
      const globHostMap = {};
      const userHostFile = this.userHostFilesMap[userId] || {};
      Object.keys(userHostFile).forEach(name => {
        const file = this.userHostFilesMap[userId][name];
        if (!file.checked) {
          return;
        }
        forEach(file.content, (ip, host) => {
          if (host.startsWith('*')) {
            globHostMap[host.substr(1, host.length)] = ip;
          } else {
            hostMap[host] = ip;
          }
        });
      });
      hosts = {
        globHostMap,
        hostMap,
      };
      this.inUsingHostsMapCache[userId] = hosts;
    }
    return hosts;
  }
}
