#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const proxyDataDir = path.join(os.homedir(), '.front-end-proxy');

function resetFile(filePath, data, force) {
  if (!force && fs.existsSync(filePath)) {
    return;
  }
  fs.writeJSONSync(filePath, data);
}

/**
 * 初始化脚本
 * @param force
 */
function resetData(force = false) {
  fs.ensureDirSync(proxyDataDir);
  fs.ensureDirSync(path.join(proxyDataDir, 'certificate'));
  fs.ensureDirSync(path.join(proxyDataDir, 'certificate/root'));
  fs.ensureDirSync(path.join(proxyDataDir, 'host'));
  fs.ensureDirSync(path.join(proxyDataDir, 'rule'));
  fs.ensureDirSync(path.join(proxyDataDir, 'breakpoint'));
  fs.ensureDirSync(path.join(proxyDataDir, 'mock-data'));
  fs.ensureDirSync(path.join(proxyDataDir, 'mock-list'));
  fs.ensureDirSync(path.join(proxyDataDir, 'profile'));
  fs.ensureDirSync(path.join(proxyDataDir, 'filter'));
  fs.ensureDirSync(path.join(proxyDataDir, 'traffic'));

  resetFile(path.join(proxyDataDir, 'clientIpUserMap.json'), {}, force);
  resetFile(path.join(proxyDataDir, 'configure.json'), {}, force);
  const rootTargetDir = path.join(proxyDataDir, 'certificate/root');
  ['zproxy.crt.pem', 'zproxy.key.pem'].forEach(f => {
    fs.copyFileSync(
      path.join(__dirname, '../certificate', f),
      path.join(rootTargetDir, f),
    );
  });
}

(() => {
  console.log('开始初始化数据...');
  resetData();
  console.log('初始化完成!');
})();
