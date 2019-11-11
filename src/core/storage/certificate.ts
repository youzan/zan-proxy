import del from 'del';
import fs from 'fs-extra';
import LRUCache from 'lru-cache';
import path from 'path';
import Container, { Service } from 'typedi';

import { AppInfoService } from '@core/services';
import { CertificateModel } from '@core/types/certificate';

const SELF_ROOT_KEY = '$$SELF_ROOT$$';

/**
 * 证书信息存储管理
 */
@Service({
  factory: () => {
    const appInfoService = Container.get(AppInfoService);
    return new CertificateStorage(path.join(appInfoService.proxyDataDir, 'certificate'));
  },
})
export class CertificateStorage {
  private cache: LRUCache<string, CertificateModel> = new LRUCache({
    max: 500, // 最多保存 500 个证书信息
    maxAge: 1000 * 60 * 60, // 60分钟保留时间
  });

  constructor(private storagePath: string) {}

  private getCertPath(domain: string) {
    return path.join(this.storagePath, `${domain}.crt`);
  }

  private getKeyPath(domain: string) {
    return path.join(this.storagePath, `${domain}.key`);
  }

  public async has(domain: string) {
    return Promise.all([fs.pathExists(this.getCertPath(domain)), fs.pathExists(this.getKeyPath(domain))]).then(
      ([certExist, keyExist]) => certExist && keyExist,
    );
  }

  public async get(domain: string) {
    if (this.cache.has(domain)) {
      return this.cache.get(domain);
    }

    const cert: CertificateModel = {
      cert: await fs.readFile(this.getCertPath(domain), {
        encoding: 'utf-8',
      }),
      key: await fs.readFile(this.getKeyPath(domain), { encoding: 'utf-8' }),
    };
    this.cache.set(domain, cert);
    return cert;
  }

  public async set(domain: string, cert: CertificateModel) {
    return Promise.all([
      fs.writeFile(this.getCertPath(domain), cert.cert, {
        encoding: 'utf-8',
      }),
      fs.writeFile(this.getKeyPath(domain), cert.key, { encoding: 'utf-8' }),
    ]);
  }

  public async clear() {
    this.cache.reset();
    return del(['*.key', '*.crt', '!root'], {
      cwd: this.storagePath,
      dot: true,
    });
  }

  /**
   * 获取 zan-proxy 的根证书信息
   */
  public async getRootCert() {
    if (this.cache.has(SELF_ROOT_KEY)) {
      return this.cache.get(SELF_ROOT_KEY);
    }

    const dir = path.join(this.storagePath, 'root');
    const cert: CertificateModel = {
      cert: await fs.readFile(path.join(dir, 'zproxy.crt.pem'), {
        encoding: 'utf-8',
      }),
      key: await fs.readFile(path.join(dir, 'zproxy.key.pem'), {
        encoding: 'utf-8',
      }),
    };
    this.cache.set(SELF_ROOT_KEY, cert);
    return cert;
  }
}
