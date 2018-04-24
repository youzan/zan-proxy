import parseDomain from 'parse-domain'
import { Inject, Service } from 'typedi'
import pem, { CertificateCreationOptions, CertificateCreationResult } from 'pem'
import LRU from 'lru-cache'
import { promisify } from 'util'

import {
  ICertificateService,
  ICertificateServiceId,
  ICertificate,
  CertStorageToken,
  Storage,
  Runtime,
  RuntimeService
} from '../service'

const createCertificate: (
  options: CertificateCreationOptions
) => Promise<CertificateCreationResult> = <any>promisify(pem.createCertificate)

const SELF_ROOT_KEY = '$$ROOT_CERT$$'

@Service({
  id: ICertificateServiceId,
  global: true
})
export class CertificationService implements ICertificateService {

  @Inject(CertStorageToken) private storage: Storage
  cache: LRU.Cache<string | Symbol, ICertificate>

  constructor(
    @Inject(RuntimeService) private runtime: Runtime,
  ) {
    this.cache = LRU({
      max: this.runtime.getMaxCertCache()
    })
  }

  /**
   * 为指定域名创建证书 (使用自定义的根证书)
   * @param host
   * @returns {Promise<Certification>}
   */
  async createCertificate(host: string): Promise<ICertificate> {
    const root = await this.getRoot()
    const cert = await createCertificate({
      serviceKey: root.key,
      serviceCertificate: root.cert,
      commonName: host,
      altNames: [host],
      days: 365 * 10
    })

    return {
      key: cert.clientKey,
      cert: cert.certificate
    }
  }

  /**
   * 为域名获取证书
   * @param host
   * @returns {Promise<Certification>}
   */
  async getCertificationForHost(host: string): Promise<ICertificate> {
    let domain = host
    /**
     * 解析后 www.baidu.com
     * {
     *   domain: "baidu"
     *   subdomain: "www"
     *   tld: "com"
     *  }
     * @type {*}
     */
    let parsed = parseDomain(host)
    // 寻找一级域名
    if (parsed && parsed.subdomain) {
      let subdomainList = parsed.subdomain.split('.')
      subdomainList.shift()
      if (subdomainList.length > 0) {
        domain =
          '*.' +
          subdomainList.join('.') +
          '.' +
          parsed.domain +
          '.' +
          parsed.tld
      }
    }

    // 从缓存里取数据
    if (this.cache.has(domain)) {
      return <any>this.cache.get(domain)
    }

    const stored = await this.storage.get(domain)
    if (stored) {
      this.cache.set(domain, stored)
      return stored
    }
    const cert = await this.createCertificate(domain)
    this.storage.set(domain, cert)
    this.cache.set(domain, cert)
    return cert
  }

  async getRoot(): Promise<ICertificate> {
    if (this.cache.has(SELF_ROOT_KEY)) {
      return <ICertificate>this.cache.get(SELF_ROOT_KEY)
    }
    const root = await this.storage.get(SELF_ROOT_KEY)
    this.cache.set(SELF_ROOT_KEY, root)
    return root
  }
}
