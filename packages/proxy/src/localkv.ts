import { Service } from 'typedi'
import path from 'path'
import { promisify } from 'util'

import { RootStorageToken, Storage } from 'lib-zan-proxy/lib/service'

const native = require('../native')

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] as string
}

const create = promisify(native.create)
const get = promisify(native.get)
// const set = promisify(native.set)
const set = (...args) => new Promise<any>((resolve, reject) => {
  console.log('callback called')
  native.set(...args, (err, r) => {
    if (err) {
      reject(err)
    } else {
      resolve(r)
    }
  })
})
const remove = promisify(native.remove)

export async function createLocalKVService() {
  const service = new LocalKVService()
  await service.init()
  return service
}

@Service({
  id: RootStorageToken,
  global: true
})
export class LocalKVService implements Storage {
  ptr: string

  async init() {
    const ptr = await create(path.resolve(getUserHome(), '.front-end-proxy/store'))
    Object.defineProperty(this, 'ptr', {
      value: ptr,
      writable: false,
      enumerable: false,
      configurable: false
    })
  }

  async get(key: string, defaultValue: any) {
    const value = await get(this.ptr, key)
    if (!value) {
      return defaultValue
    }
    return JSON.parse(value)
  }

  async set(key: string, value: any) {
    const data = JSON.stringify(value)
    return set(this.ptr, key, data)
  }

  async remove(key: string) {
    return remove(this.ptr, key)
  }

  close() {
    native.close(this.ptr)
  }
}
