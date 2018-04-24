import ip from 'ip'
import { Service } from 'typedi'
import getPort from 'get-port'
import {
    Runtime as IRuntime,
    ProxyConfig
} from '../service'

@Service({
    global: true,
})
export class RuntimeService implements IRuntime {
    private config: ProxyConfig
    private start: Date
    private ip: string
    private httpsPort: number

    constructor(config: ProxyConfig) {
        this.config = config
        this.ip = ip.address()
        this.start = new Date()
    }

    getHttpPort() {
        return this.config.httpProxyPort
    }

    getMaxCertCache() {
        return this.config.maxCertCache
    }

    getIP() {
        return this.ip
    }

    getRuningtime() {
        return Date.now() - this.start.getTime()
    }

    getHttpsPort() {
        return this.httpsPort
    }

    async init() {
        this.httpsPort = await getPort()
    }

    static async New(config: ProxyConfig) {
        const runtime = new RuntimeService(config)
        await runtime.init()
        return runtime
    }
}