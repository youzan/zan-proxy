import { Token } from 'typedi';
import { HasAsyncInit } from './hasAsyncInit'
import { Storage } from './Storage'

export interface HostFile {
    meta: HostFileMeta
    checked: boolean
    name: string
    description: string
    content: object
}

export interface HostFileMeta {
    local: boolean
}

export interface HostService extends HasAsyncInit {
    resolveHost(hostname: string): Promise<string>
    createHostFile(name: string, description: string, content?): Promise<HostFile>
    deleteHostFile(name: string): Promise<HostFile | undefined>
    setUseHost(name: string): Promise<HostFile | undefined>
    getHostFile(name: string): Promise<HostFile | undefined>
    saveHostFile(name: string, content: object): Promise<HostFile>
}

export const HostServiceToken = new Token<HostService>('service.host')
export const HostStorageToken = new Token<Storage>('storage.host')