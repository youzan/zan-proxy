import fs from 'fs-extra';
import path from 'path';

import { CertificateModel } from '@core/types/certificate';

/**
 * 证书信息存储管理
 */
export class CertificateStorage {
  constructor(private storagePath: string) {}
  public async has(domain: string): Promise<boolean> {
    return await fs.pathExists(this.getCertPath(domain));
  }
  public async get(domain: string): Promise<CertificateModel> {
    const cert = {
      cert: '',
      key: '',
    };
    cert.key = await fs.readFile(this.getKeyPath(domain), { encoding: 'utf-8' });
    cert.cert = await fs.readFile(this.getCertPath(domain), {
      encoding: 'utf-8',
    });
    return cert;
  }

  public async set(domain: string, cert: CertificateModel) {
    await fs.writeFile(this.getCertPath(domain), cert.cert, {
      encoding: 'utf-8',
    });
    await fs.writeFile(this.getKeyPath(domain), cert.key, { encoding: 'utf-8' });
  }

  public async getRoot(): Promise<CertificateModel> {
    const dir = path.join(this.storagePath, 'root');
    const root = {
      cert: await fs.readFile(path.join(dir, 'zproxy.crt.pem'), {
        encoding: 'utf-8',
      }),
      key: await fs.readFile(path.join(dir, 'zproxy.key.pem'), {
        encoding: 'utf-8',
      }),
    };
    return root;
  }

  public getCertPath(domain) {
    return path.join(this.storagePath, `${domain}.crt`);
  }

  public getKeyPath(domain) {
    return path.join(this.storagePath, `${domain}.key`);
  }
}
