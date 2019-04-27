import { CertificateModel } from '@core/types/certificate';
import { promisify } from 'es6-promisify';
import parseDomain from 'parse-domain';
import pem from 'pem';
import { Inject, Service } from 'typedi';

import { CertificateStorage } from '../storage';

const pemCreateCertificate = promisify(pem.createCertificate);

/**
 * 证书处理 service
 */
@Service()
export class CertificateService {
  /**
   * @param storage 证书存储服务
   */
  @Inject() private storage: CertificateStorage;

  /**
   * 为域名获取证书
   */
  public async getCertificationForHost(host: string) {
    let domain = host;
    const parsed = parseDomain(host);
    // 若有两级及两级以上的域名，则以当前域名的上一级父域名为证书域名，如 a.b.c.com 则以 *.b.c.com 为证书域名
    if (parsed && parsed.subdomain) {
      const subdomainList = parsed.subdomain.split('.');
      subdomainList.shift();
      if (subdomainList.length > 0) {
        domain = '*.' + subdomainList.join('.') + '.' + parsed.domain + '.' + parsed.tld;
      }
    }

    const hasCertFile = await this.storage.has(domain);
    if (hasCertFile) {
      const certInStorage = await this.storage.get(domain);
      return certInStorage;
    }
    const cert = await this.create(domain);
    this.storage.set(domain, cert);
    return cert;
  }

  /**
   * 为指定域名创建证书 (使用自定义的根证书)
   */
  private async create(host: string): Promise<CertificateModel> {
    const root = await this.storage.getRootCert();
    const res = await pemCreateCertificate({
      altNames: [host],
      commonName: host,
      days: 365 * 10,
      serviceCertificate: root && root.cert,
      serviceKey: root && root.key,
    });
    return {
      cert: res.certificate,
      key: res.clientKey,
    };
  }
}
