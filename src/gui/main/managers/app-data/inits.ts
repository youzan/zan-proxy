import * as childProcess from 'child_process';
import logger from 'electron-log';
import * as path from 'path';
import * as sudo from 'sudo-prompt';

const execIcon = {
  name: 'Zan Proxy',
  icns: path.resolve(global.__static, 'icon.icns'),
};

const certPath = path.join(global.__resource, 'certificate', 'zproxy.crt.pem');
/**
 * 初始化签名证书文件
 */
export async function initCert() {
  return new Promise(resolve => {
    try {
      // 检查是否已经安装证书
      childProcess.execSync('security find-certificate -c zan-proxy', { encoding: 'utf-8' });
    } catch (e) {
      // tslint:disable-next-line: ter-max-len
      const cmd = `security add-trusted-cert -d -r trustRoot -p ssl -k /Library/Keychains/System.keychain "${certPath}"`;
      sudo.exec(cmd, execIcon, (error, stdout) => {
        if (error) {
          throw error;
        }
        logger.info(`initCert stdout: ${stdout}`);
      });
    }
    resolve();
  });
}
