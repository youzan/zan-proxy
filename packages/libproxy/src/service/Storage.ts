import { Token } from 'typedi'

export interface Storage {
  get(key: string, data?: any): Promise<any>
  set(key: string, data: any): Promise<any>
  remove(key: string): Promise<any>
}

export const KVStorageToken = new Token<Storage>('storage')
export const RootStorageToken = new Token<Storage>('storage.Root')
export const CertStorageToken = new Token<Storage>('storage.Cert')
export const ProfileConfigStorageToken = new Token<Storage>('storage.ProfileConfig')
export const RuleStorageToken = new Token<Storage>('storage.Rule')
export const MockStorageToken = new Token<Storage>('storage.Mock')