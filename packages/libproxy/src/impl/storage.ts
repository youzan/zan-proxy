import path from 'path'
import { Storage } from '../service'

export class ScopedKVService implements Storage {
  constructor(
    public readonly rootKVService: Storage,
    public readonly path: string = ''
  ) {

  }

  async get(key: string, data?: any): Promise<any> {
    return this.rootKVService.get(path.resolve(this.path, key), data)
  }

  async set(key: string, data: any): Promise<any> {
    return this.rootKVService.set(path.resolve(this.path, key), data)
  }

  async remove(key: string): Promise<any> {
    return this.rootKVService.remove(path.resolve(this.path, key))
  }

  createScoped(key: string) {
    return new ScopedKVService(this.rootKVService, path.resolve(this.path, key))
  }
}
