import { Token } from 'typedi'

export interface Runtime {
  getHttpPort(): number,
  getIP(): string,
  getHttpsPort(): number,
  getRuningtime(): number,
  getMaxCertCache(): number,
}

export const RuntimeService = new Token<Runtime>('Runtime')
