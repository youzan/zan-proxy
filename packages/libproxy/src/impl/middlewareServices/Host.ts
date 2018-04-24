import { Service, Inject } from 'typedi'
import { EventEmitter } from 'events'
import { HostService as IHostService, HostServiceToken, Storage, HostStorageToken, HostFile } from '../../service'

const ipReg = /((?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d))/;
const storageKey = '$HOST_FILES$'

@Service({
    id: HostServiceToken,
})
export class HostService extends EventEmitter implements IHostService {
    @Inject(HostStorageToken) storage:  Storage
    hostFiles: Array<HostFile> = []
    activeHosts: {}
    
    async init() {
        this.hostFiles = await this.storage.get(storageKey) || []
        this.renewActiveHosts()
    }
    async resolveHost(hostname: string) {
        if (ipReg.test(hostname)) {
            return hostname
        }
        let ip = this.activeHosts[hostname]
        if (ip) {
            return ip
        }
        ip = Object.keys(this.activeHosts)
            .filter(host => host.startsWith('*') && hostname.endsWith(host.substr(1)))
            .map(host => this.activeHosts[host])[0]
        if (ip) {
            return ip
        }
        return hostname
        
    }
    async createHostFile(name, description, content?) {
        const f = await this.getHostFile(name)
        if (f) {
            throw new Error('Host file exists already')
        }
        const file: HostFile = {
            meta: {
                local: true
            },
            checked: false,
            name,
            description,
            content: content || {}
        }
        this.hostFiles.push(file)
        await this.onHostFilesChange()
        this.emit('host-saved', name, file)
        return file
    }

    async deleteHostFile(name) {
        const file = await this.getHostFile(name)
        this.hostFiles = this.hostFiles.filter(hostFile => name != hostFile.name)
        await this.onHostFilesChange()
        this.emit('host-deleted', name)
        return file
    }

    async getHostFile(name) {
        const file = this.hostFiles.filter(hostFile => name === hostFile.name)[0]
        return file
    }

    async setUseHost(name) {
        const file = await this.getHostFile(name)
        this.hostFiles.forEach(hostFile => {
            if (hostFile.name === name) {
                hostFile.checked = true
            } else {
                hostFile.checked = false
            }
        })
        await this.onHostFilesChange()
        return file
    }

    async saveHostFile(name, content) {
        let file = await this.getHostFile(name)
        if (!file) {
            throw new Error('Host file not exist')
        }
        file = Object.assign(file, content)
        await this.onHostFilesChange()
        this.emit('host-saved', name, content)
        return file
    }

    async onHostFilesChange() {
        this.storage.set(storageKey, this.hostFiles)
        this.renewActiveHosts()
        this.emit('data-change', this.hostFiles)
    }

    async getHostFileList() {
        return this.hostFiles
    }

    renewActiveHosts() {
        this.activeHosts = this.hostFiles
            .filter(hostFile => hostFile.checked)
            .map(hostFile => hostFile.content)
            .reduce((prev, hostFileContent) => {
                return Object.assign(prev, hostFileContent)
            }, {})
    }
}