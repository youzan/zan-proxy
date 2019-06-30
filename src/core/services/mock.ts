import EventEmitter from 'events';
import fs from 'fs-extra';
import { find, forEach } from 'lodash';
import path from 'path';
import { Service } from 'typedi';

import { AppInfoService } from './appInfo';

/**
 * 数据mock
 */
@Service()
export class MockDataService extends EventEmitter {
  private mockListDir: string;
  private mockDataDir: string;
  private mockDataList: object;
  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.proxyDataDir;
    // 存放mock data的目录
    this.mockDataDir = path.join(proxyDataDir, 'mock-data');
    this.mockListDir = path.join(proxyDataDir, 'mock-list');
    // userId -> datalist
    this.mockDataList = {};

    const contentMap = fs
      .readdirSync(this.mockListDir)
      .filter(name => name.endsWith('.json'))
      .reduce((prev, curr) => {
        prev[curr] = fs.readJsonSync(path.join(this.mockListDir, curr));
        return prev;
      }, {});
    forEach(contentMap, (content, fileName) => {
      const userId = fileName.slice(0, -5);
      this.mockDataList[userId] = content;
    });
  }

  /**
   * 获取数据文件内容
   * @param clientIp
   * @param dataId
   */
  public async getDataFileContent(userId, dataId) {
    const dataFilePath = this.getDataFilePath(userId, dataId);
    try {
      return await fs.readFile(dataFilePath, { encoding: 'utf-8' });
    } catch (e) {
      return '';
    }
  }

  /**
   * 获取数据文件的 content type
   * {id:'',contentType:'',name:''}
   * @returns {*}
   */
  public async getDataFileContentType(userId, dataId) {
    const list = this.mockDataList[userId];
    // 寻找
    const finded = find(list, entry => {
      return entry.id === dataId;
    });
    if (!finded) {
      return '';
    }
    return finded.contentType + ';charset=utf-8';
  }

  /**
   * 获取某个用户的数据列表
   * @param userId
   * @returns {*}
   */
  public getMockDataList(userId) {
    return this.mockDataList[userId] || [];
  }

  public async setMockDataList(userId, mocklist) {
    this.mockDataList[userId] = mocklist;
    const listFilePath = this.getMockEntryPath(userId);
    await fs.writeJson(listFilePath, mocklist, { encoding: 'utf-8' });
    // 发送消息通知
    this.emit('data-change', userId, this.getMockDataList(userId));
  }

  /**
   * 保存数据文件列表，清除无用的数据文件
   * @param userId
   * @param dataList
   */
  public async saveMockDataList(userId, dataList) {
    // 找出要被被删除的数据文件, 老的数据文件里有，而新的没有
    const newDataKeys = new Set();
    const toRemove: any[] = [];
    dataList.forEach(data => {
      newDataKeys.add(data.id);
    });
    const originMockDataList = this.getMockDataList(userId);
    originMockDataList.forEach(data => {
      if (!newDataKeys.has(data.id)) {
        toRemove.push(data.id);
      }
    });
    // 设置新值
    await this.setMockDataList(userId, dataList);

    // 删除文件
    for (const rId of toRemove) {
      const dataPath = this.getDataFilePath(userId, rId);
      await fs.remove(dataPath);
    }
  }

  /**
   * 用户保存数据文件
   * @param userId
   * @param dataFileId
   * @param content
   */
  public async saveDataFileContent(userId, dataFileId, content) {
    const dataFilePath = this.getDataFilePath(userId, dataFileId);
    await fs.writeFile(dataFilePath, content, { encoding: 'utf-8' });
  }

  /**
   * 获取数据文件路径
   * @param userId
   * @param dataId
   * @private
   */
  private getDataFilePath(userId, dataId) {
    const p = path.join(this.mockDataDir, userId + '_' + dataId);
    if (!fs.existsSync(p)) {
      return p;
    }
    const dataFileRealPath = fs.realpathSync(p);
    if (dataFileRealPath.includes(this.mockDataDir)) {
      return p;
    } else {
      return '';
    }
  }

  /**
   * 获取数据文件列表
   * @param userId
   * @private
   */
  private getMockEntryPath(userId) {
    return path.join(this.mockListDir, userId + '.json');
  }
}
