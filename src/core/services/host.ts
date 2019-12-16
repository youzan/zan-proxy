import EventEmitter from 'events';
import fs from 'fs-extra';
import { defaults, find, forEach, get } from 'lodash';
import path from 'path';
import { HttpError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';

import { IHostFile } from '@core/types/host';
import { request } from '@core/utils';

import { AppInfoService } from './appInfo';

const IP_REG = /((?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d))/;

interface IUsingHostMap {
  globHostMap: { [host: string]: string };
  hostMap: { [host: string]: string };
}

@Service()
@Service('HostService')
export class HostService extends EventEmitter {
  private hostFilesMap: {
    [fileName: string]: IHostFile;
  };
  private hostSaveDir: string;

  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.proxyDataDir;
    this.hostSaveDir = path.join(proxyDataDir, 'host');

    this.hostFilesMap = fs
      .readdirSync(this.hostSaveDir)
      .filter(name => name.endsWith('.json'))
      .reduce((map, fileName) => {
        try {
          const content: IHostFile = fs.readJsonSync(path.join(this.hostSaveDir, fileName));
          map[content.name] = content;
        } catch (e) {
          // ignore
        }
        return map;
      }, {});
  }

  /**
   * 获取 host 配置文件路径
   */
  private getHostFilePath(name: string) {
    const fileName = `${name}.json`;
    const filePath = path.join(this.hostSaveDir, fileName);
    return filePath;
  }

  /**
   * 获取生效的host
   */
  private get usingHosts(): IUsingHostMap {
    // 读文件加载host
    const hostMap = {};
    const globHostMap = {};
    forEach(this.hostFilesMap, (_, name) => {
      const file = this.hostFilesMap[name];
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
    return {
      globHostMap,
      hostMap,
    };
  }

  private exist(name: string): boolean {
    return !!this.hostFilesMap[name];
  }

  /**
   * 根据 host 配置解析域名到 ip
   */
  public resolveHost(hostname: string): string {
    if (!hostname) {
      return hostname;
    }

    // 访问 ip 地址时，不做 host 解析
    if (IP_REG.test(hostname)) {
      return hostname;
    }

    let ip: string | undefined;
    const usingHosts = this.usingHosts;
    ip = usingHosts.hostMap[hostname];
    if (ip) {
      return ip;
    }
    // 匹配 * 开头的host，计算属性 globHostMap 已经将 * 去除
    ip = find(usingHosts.globHostMap, (_, host) => {
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
  public getHostFileList() {
    return Object.values(this.hostFilesMap);
  }

  /**
   * 创建host文件
   */
  public async create(hostFile: IHostFile) {
    const { name, description, content = {} } = hostFile;
    if (this.exist(name)) {
      // 文件已经存在，无法创建
      throw new HttpError(409, 'Host规则已存在');
    }

    const entity: IHostFile = {
      name,
      meta: {
        local: true,
      },
      description,
      checked: false,
      content,
    };
    this.hostFilesMap[name] = entity;

    await this.saveHostFile(name, entity);
  }

  /**
   * 删除 host 文件
   */
  public async deleteHostFile(name: string) {
    if (!this.exist(name)) {
      throw new NotFoundError('找不到对应名称的Host配置');
    }

    delete this.hostFilesMap[name];
    /** 删除文件 */
    const filePath = this.getHostFilePath(name);
    const exists = await fs.pathExists(filePath);
    if (exists) {
      await fs.remove(filePath);
    }
    this.emit('data-change', this.getHostFileList());
  }

  /**
   * 启用或禁用某个host配置
   */
  public async toggleHost(name: string, checked: boolean) {
    if (!this.exist(name)) {
      throw new NotFoundError('找不到对应名称的Host配置');
    }

    const hostFile = this.hostFilesMap[name];
    hostFile.checked = checked;
    await this.saveHostFile(name, hostFile);
  }

  /**
   * 获取某个 host 配置
   */
  public getHostFile(name: string) {
    if (!this.exist(name)) {
      throw new NotFoundError('找不到对应名称的Host配置');
    }

    return this.hostFilesMap[name];
  }

  /**
   * 保存某个 host 配置
   */
  public async saveHostFile(name: string, content: IHostFile) {
    this.hostFilesMap[name] = content;

    const hostFilePath = this.getHostFilePath(name);
    await fs.writeJson(hostFilePath, content, { encoding: 'utf-8' });
    this.emit('data-change', this.getHostFileList());
  }

  /**
   * 导入远程 host 配置
   */
  public async importRemoteHostFile(url: string) {
    const resp = await request.get(url);
    const file: IHostFile = await resp.json();

    Object.assign(file, {
      meta: {
        local: false,
        url,
      },
      checked: false,
    });
    defaults(file, {
      content: {},
    });
    await this.saveHostFile(file.name, file);
  }
}
