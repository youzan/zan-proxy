import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const proxyDataDir = path.join(os.homedir(), '.front-end-proxy');

/**
 * 初始化脚本
 * @param force
 */
export default function resetDataFiles(force = false) {
  console.log('开始初始化数据...');
  fs.ensureDirSync(proxyDataDir);
  fs.ensureDirSync(path.join(proxyDataDir, 'certificate'));
  fs.ensureDirSync(path.join(proxyDataDir, 'certificate/root'));
  fs.ensureDirSync(path.join(proxyDataDir, 'host'));
  fs.ensureDirSync(path.join(proxyDataDir, 'rule'));
  fs.ensureDirSync(path.join(proxyDataDir, 'mock-data'));
  fs.ensureDirSync(path.join(proxyDataDir, 'mock-list'));
  fs.ensureDirSync(path.join(proxyDataDir, 'profile'));
  fs.ensureDirSync(path.join(proxyDataDir, 'traffic'));

  const rootTargetDir = path.join(proxyDataDir, 'certificate/root');
  ['zproxy.crt.pem', 'zproxy.key.pem'].forEach(f => {
    fs.copyFileSync(path.join(global.__resource, 'certificate', f), path.join(rootTargetDir, f));
  });
  console.log('初始化完成!');
}
