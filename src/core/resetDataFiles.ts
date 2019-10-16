import fs from 'fs-extra';
import { each } from 'lodash';
import path from 'path';
import Container from 'typedi';

import { AppInfoService } from './services';

const proxyDataDir = Container.get(AppInfoService).proxyDataDir;

function rm(p: string) {
  if (fs.existsSync(p)) {
    fs.removeSync(p);
  }
}

function move(source: string, target: string, transformer?: (text: string) => string) {
  if (fs.existsSync(source)) {
    let text = fs.readFileSync(source, 'utf-8');
    if (transformer) {
      text = transformer(text);
    }
    fs.writeFileSync(target, text, 'utf-8');
    fs.removeSync(source);
  }
}

/**
 * 旧版数据迁移方法
 */
export function migrateFromOld() {
  // 非旧版配置
  if (!fs.existsSync(path.join(proxyDataDir, 'clientIpUserMap.json'))) {
    return;
  }

  const backDir = proxyDataDir + '-bak';
  console.log('备份旧版数据');
  fs.copySync(proxyDataDir, backDir);

  console.log('开始迁移旧版数据');
  const unusedFileOrDir = [
    path.join(proxyDataDir, 'clientIpUserMap.json'),
    path.join(proxyDataDir, 'configure.json'),
    path.join(proxyDataDir, 'filter'),
    path.join(proxyDataDir, 'breakpoint'),
  ];
  unusedFileOrDir.forEach(rm);

  // profile
  const profile = {
    source: path.join(proxyDataDir, 'profile/root.json'),
    target: path.join(proxyDataDir, 'profile.json'),
  };
  move(profile.source, profile.target, text => {
    const profileContent = JSON.parse(text);
    delete profileContent.enableFilter;
    return JSON.stringify(profileContent);
  });
  rm(path.join(profile.source, '..'));

  // mock-data & mock-list
  const mockList = {
    source: path.join(proxyDataDir, 'mock-list/root.json'),
    target: path.join(proxyDataDir, 'mock-list.json'),
  };
  move(mockList.source, mockList.target, text => {
    const data = JSON.parse(text);
    each(data, item => {
      item.contentType = item.contenttype;
      delete item.contenttype;
    });
    return JSON.stringify(data);
  });
  rm(path.join(mockList.source, '..'));

  const mockRecordFiles = fs.readdirSync(path.join(proxyDataDir, 'mock-data'));
  mockRecordFiles.forEach(file => {
    if (!file.startsWith('root_')) {
      return;
    }
    move(path.join(proxyDataDir, 'mock-data', file), path.join(proxyDataDir, 'mock-data', file.replace(/^root_/, '')));
  });

  // host
  const hostFiles = fs.readdirSync(path.join(proxyDataDir, 'host'));
  hostFiles.forEach(file => {
    if (!file.startsWith('root_')) {
      return;
    }
    move(path.join(proxyDataDir, 'host', file), path.join(proxyDataDir, 'host', file.replace(/^root_/, '')));
  });

  // rule
  const ruleFiles = fs.readdirSync(path.join(proxyDataDir, 'rule'));
  ruleFiles.forEach(file => {
    if (!file.startsWith('root_')) {
      return;
    }
    move(path.join(proxyDataDir, 'rule', file), path.join(proxyDataDir, 'rule', file.replace(/^root_/, '')));
  });
  console.log('旧版数据迁移完毕');
}

/**
 * 初始化脚本
 */
export function resetDataFiles() {
  console.log('开始初始化数据...');
  fs.ensureDirSync(proxyDataDir);
  fs.ensureDirSync(path.join(proxyDataDir, 'certificate'));
  fs.ensureDirSync(path.join(proxyDataDir, 'certificate/root'));
  fs.ensureDirSync(path.join(proxyDataDir, 'host'));
  fs.ensureDirSync(path.join(proxyDataDir, 'rule'));
  fs.ensureDirSync(path.join(proxyDataDir, 'mock-data'));
  fs.ensureDirSync(path.join(proxyDataDir, 'traffic'));

  const rootTargetDir = path.join(proxyDataDir, 'certificate/root');
  ['zproxy.crt.pem', 'zproxy.key.pem'].forEach(f => {
    fs.copyFileSync(path.join(global.__resource, 'certificate', f), path.join(rootTargetDir, f));
  });
  console.log('初始化完成!');
}
