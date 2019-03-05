export interface CertificateModel {
  cert: string;
  key: string;
}

export interface CertificateService {
  getCertificationForHost(host: string): Promise<CertificateModel>;
}

export interface CertificateStorage {
  getRoot(): Promise<CertificateModel>;
  has(domain: string): Promise<boolean>;
  get(domain): Promise<CertificateModel | undefined>;
  set(domain, CertificateModel): Promise<any>;
}
