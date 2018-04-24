import { Token } from 'typedi'

export interface ICertificate {
  key: string
  cert: string
}

export interface ICertificateService {
  createCertificate(host: string): Promise<ICertificate>
  getCertificationForHost(host: string): Promise<ICertificate>
}

export const ICertificateServiceId = new Token<ICertificateService>('service.Cert')