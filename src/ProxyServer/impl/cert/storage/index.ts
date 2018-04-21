import { promisify } from 'es6-promisify';
import fs from 'fs';
import path from 'path';
import {
  CertificateModel,
  CertificateStorage as ICertificateStorage,
} from '../../../interfaces';

const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsExists = (p): Promise<boolean> =>
  new Promise(resolve => {
    fs.exists(p, exists => {
      resolve(exists);
    });
  });

export class CertificateStorage implements ICertificateStorage {
  constructor(private storagePath: string) {}
  public async has(domain: string): Promise<boolean> {
    return await fsExists(this.getCertPath(domain));
  }
  public async get(domain: string): Promise<CertificateModel> {
    const cert = {
      cert: '',
      key: '',
    };
    cert.key = await fsReadFile(this.getKeyPath(domain), { encoding: 'utf-8' });
    cert.cert = await fsReadFile(this.getCertPath(domain), {
      encoding: 'utf-8',
    });
    return cert;
  }

  public async set(domain: string, cert: CertificateModel) {
    await fsWriteFile(this.getCertPath(domain), cert.cert, {
      encoding: 'utf-8',
    });
    await fsWriteFile(this.getKeyPath(domain), cert.key, { encoding: 'utf-8' });
  }

  public async getRoot() {
    const dir = path.join(this.storagePath, 'root');
    const root = {
      cert: await fsReadFile(path.join(dir, 'zproxy.crt.pem'), {
        encoding: 'utf-8',
      }),
      key: await fsReadFile(path.join(dir, 'zproxy.key.pem'), {
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
