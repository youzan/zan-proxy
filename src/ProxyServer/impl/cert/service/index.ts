import { promisify } from 'es6-promisify';
import parseDomain from 'parse-domain';
import pem from 'pem';

import {
  Cache,
  CertificateService as ICertificateService,
  CertificateStorage,
} from './../../../interfaces';

const pemCreateCertificate = promisify(pem.createCertificate);
const SELF_ROOT_KEY = '$$SELF_ROOT$$';

export class CertificateService implements ICertificateService {
  /**
   *
   * @param storage 证书存储服务
   * @param cache 缓存服务
   */
  constructor(private storage: CertificateStorage, private cache: Cache) {}
  /**
   * 为域名获取证书
   * @param host
   * @returns {Promise<Certification>}
   */
  public async getCertificationForHost(host) {
    let domain = host;
    /**
     * 解析后 www.baidu.com
     * {
     *   domain: "baidu"
     *   subdomain: "www"
     *   tld: "com"
     *  }
     * @type {*}
     */
    const parsed = parseDomain(host);
    // 寻找一级域名
    if (parsed && parsed.subdomain) {
      const subdomainList = parsed.subdomain.split('.');
      subdomainList.shift();
      if (subdomainList.length > 0) {
        domain =
          '*.' +
          subdomainList.join('.') +
          '.' +
          parsed.domain +
          '.' +
          parsed.tld;
      }
    }

    // 从缓存里取数据
    if (this.cache.has(domain)) {
      return this.cache.get(domain);
    }
    const storageHas = await this.storage.has(domain);
    if (storageHas) {
      const certInStorage = await this.storage.get(domain);
      this.cache.set(domain, certInStorage);
      return certInStorage;
    }
    const cert = await this.create(domain);
    this.storage.set(domain, cert);
    this.cache.set(domain, cert);
    return cert;
  }

  private async getRoot() {
    if (this.cache.has(SELF_ROOT_KEY)) {
      return this.cache.get(SELF_ROOT_KEY);
    }
    const root = await this.storage.getRoot();
    this.cache.set(SELF_ROOT_KEY, root);
    return root;
  }

  /**
   * 为指定域名创建证书 (使用自定义的根证书)
   * @param host
   * @returns {Promise<Certification>}
   */
  private async create(host) {
    const root = await this.getRoot();
    const res = await pemCreateCertificate({
      altNames: [host],
      commonName: host,
      days: 365 * 10,
      serviceCertificate: root.cert,
      serviceKey: root.key,
    });
    return {
      cert: res.certificate,
      key: res.clientKey,
    };
  }
}
