import { Token } from 'typedi'

export interface KVStorage {
  get(key: string, data: any): Promise<any>
  set(key: string, data): Promise<any>
  remove(key: string): Promise<any>
}

export const KVStorageToken = new Token<KVStorage>('storage')
export const RootStorageToken = new Token<KVStorage>('root storage')
