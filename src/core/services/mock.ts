import EventEmitter from 'events';
import fs from 'fs-extra';
import { differenceWith, find, isEqual } from 'lodash';
import path from 'path';
import { Service } from 'typedi';

import { IMockRecord } from '@core/types/mock';

import { AppInfoService } from './appInfo';

/**
 * 数据 mock Service
 */
@Service()
@Service('MockDataService')
export class MockDataService extends EventEmitter {
  private mockListFile: string;
  private mockDataDir: string;
  private mockList: IMockRecord[] = [];
  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.proxyDataDir;
    // 存放mock data的目录
    this.mockDataDir = path.join(proxyDataDir, 'mock-data');
    this.mockListFile = path.join(proxyDataDir, 'mock-list.json');

    try {
      this.mockList = fs.readJSONSync(this.mockListFile);
    } catch {
      // no operation
    }
  }

  /**
   * 获取数据文件的 content type
   */
  public async getDataFileContentType(id: string) {
    const mockRecord = find(this.mockList, entry => {
      return entry.id === id;
    });
    return mockRecord ? mockRecord.contentType + ';charset=utf-8' : '';
  }

  /**
   * 获取某个用户的数据列表
   */
  public getMockList() {
    return this.mockList;
  }

  /**
   * 设置 mock-list
   */
  public async setMockList(mockList: IMockRecord[]) {
    await fs.writeJson(this.mockListFile, mockList, { encoding: 'utf-8' });
    this.mockList = mockList;
    // 发送消息通知
    this.emit('data-change', this.mockList);
  }

  /**
   * 保存数据文件列表，清除无用的数据文件
   * @param userId
   * @param mockList
   */
  public async saveMockList(mockList: IMockRecord[]) {
    // 找出要被被删除的数据文件, 老的数据文件里有，而新的没有
    const toRemoveIds: string[] = differenceWith(
      this.mockList,
      mockList,
      (record1, record2) => record1.id === record2.id,
    ).map(record => record.id);
    // 设置新值
    await this.setMockList(mockList);

    // 删除文件
    await Promise.all(
      toRemoveIds.map(rId => {
        const dataPath = this.getDataFilePath(rId);
        return fs.remove(dataPath);
      }),
    );
  }

  /**
   * 获取数据文件内容
   */
  public async getDataContent(id: string) {
    const dataFilePath = this.getDataFilePath(id);
    try {
      return await fs.readFile(dataFilePath, { encoding: 'utf-8' });
    } catch (e) {
      return '';
    }
  }

  /**
   * 用户保存数据文件
   */
  public async saveDataContent(id: string, content: string) {
    const dataFilePath = this.getDataFilePath(id);
    await fs.ensureFile(dataFilePath);
    await fs.writeFile(dataFilePath, content, { encoding: 'utf-8' });
  }

  /**
   * 获取数据文件路径
   */
  private getDataFilePath(id: string) {
    const mockFilePath = path.join(this.mockDataDir, id);
    return mockFilePath;
  }
}
