import { promisify } from 'es6-promisify';
import EventEmitter from 'events';
import fs from 'fs';
import jsonfile from 'jsonfile';
import { find, forEach } from 'lodash';
import path from 'path';
import { Service } from 'typedi';
import { AppInfoService } from './appInfo';

const jsonfileWriteFile = promisify(jsonfile.writeFile);
const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsUnlink = promisify(fs.unlink);

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
    const proxyDataDir = appInfoService.getProxyDataDir();
    // 存放mock data的目录
    this.mockDataDir = path.join(proxyDataDir, 'mock-data');
    this.mockListDir = path.join(proxyDataDir, 'mock-list');
    // userId -> datalist
    this.mockDataList = {};

    const contentMap = fs
      .readdirSync(this.mockListDir)
      .filter(name => name.endsWith('.json'))
      .reduce((prev, curr) => {
        prev[curr] = jsonfile.readFileSync(path.join(this.mockListDir, curr));
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
    const dataFilePath = this._getDataFilePath(userId, dataId);
    try {
      return await fsReadFile(dataFilePath, { encoding: 'utf-8' });
    } catch (e) {
      return '';
    }
  }

  /**
   * 获取数据文件的 content type
   * {id:'',contenttype:'',name:''}
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
    return finded.contenttype + ';charset=utf-8';
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
    const listFilePath = this._getMockEntryPath(userId);
    await jsonfileWriteFile(listFilePath, mocklist, { encoding: 'utf-8' });
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
      const dataPath = this._getDataFilePath(userId, rId);
      await fsUnlink(dataPath);
    }
  }

  /**
   * 用户保存数据文件
   * @param userId
   * @param dataFileId
   * @param content
   */
  public async saveDataFileContent(userId, dataFileId, content) {
    const dataFilePath = this._getDataFilePath(userId, dataFileId);
    await fsWriteFile(dataFilePath, content, { encoding: 'utf-8' });
  }

  /**
   * 用户从监控窗保存一个数据文件
   */
  public async saveDataEntryFromTraffic(
    userId,
    dataFileId,
    fileName,
    contentType,
    content,
  ) {
    const dataList = this.mockDataList[userId] || [];
    dataList.push({
      contenttype: contentType,
      id: dataFileId,
      name: fileName,
    });
    // 保存mock数据文件列表
    const listFilePath = this._getMockEntryPath(userId);
    await jsonfileWriteFile(listFilePath, dataList, { encoding: 'utf-8' });
    // 保存数据文件
    const dataFilePath = this._getDataFilePath(userId, dataFileId);
    await fsWriteFile(dataFilePath, content, { encoding: 'utf-8' });
  }

  /**
   * 获取数据文件路径
   * @param userId
   * @param dataId
   * @private
   */
  private _getDataFilePath(userId, dataId) {
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
  private _getMockEntryPath(userId) {
    return path.join(this.mockListDir, userId + '.json');
  }
}
