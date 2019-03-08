import * as path from 'path';
import * as childProcess from 'child_process';
import * as sudo from 'sudo-prompt';
import logger from 'electron-log';

import { homePath } from '@gui/main/utils';

const execIcon = {
  name: 'Zan Proxy',
  icns: path.resolve(global.__static, 'icon.icns'),
};

const certPath = homePath('.front-end-proxy/certificate/root/zproxy.crt.pem');
/**
 * 初始化签名证书文件
 */
export async function initCert() {
  return new Promise(resolve => {
    try {
      // 检查是否已经安装证书
      childProcess.execSync('security find-certificate -c zProxy', { encoding: 'utf-8' });
    } catch (e) {
      const cmd = `security add-trusted-cert -d -r trustRoot -p ssl -k /Library/Keychains/System.keychain ${certPath}`;
      sudo.exec(cmd, execIcon, (error, stdout) => {
        if (error) {
          throw error;
        }
        logger.log(`stdout: ${stdout}`);
      });
    }
    resolve();
  });
}
