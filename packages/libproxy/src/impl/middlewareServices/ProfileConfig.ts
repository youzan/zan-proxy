import { Service, Inject } from 'typedi'
import { EventEmitter } from 'events'
import { template, pickBy } from 'lodash'

import {
    ProfileConfigService as IProfileConfigService,
    ProfileConfigServiceToken,
    ProfileConfigStorageToken,
    Storage,
    ProfileConfig
} from '../../service'

const storageKey = '$$PROFILE_CONFIG$$'

const defaultConfig: ProfileConfig = {
    projectPath: {},
    enableRule: true,
    enableHost: true
}

@Service({
    id: ProfileConfigServiceToken
})
export class ProfileConfigService extends EventEmitter implements IProfileConfigService {
    @Inject(ProfileConfigStorageToken) storage: Storage
    config: ProfileConfig

    async init() {
        this.config = await this.storage.get(storageKey) || defaultConfig
    }

    async getProfile() {
        return this.config
    }

    async setProfile(config) {
        this.config = config
        await this.saveConfig()
        return this.config
    }

    async saveConfig() {
        await this.storage.set(storageKey, this.config)
        // this.emit('data-change-profile', this.config)
    }

    async calcPath(href: string, match: string, target: string) {
        if (!match) {
            return href
        }
        // 正则替换
        const matches = href.match(new RegExp(match)) || []
        matches.forEach((val, index) => {
            if (index === 0) return
            const reg = new RegExp('\\$' + index, 'g')
            val = val || ''
            target = target.replace(reg, val)
        })
        // 工程路径替换
        return template(target)(this.config.projectPath)
    }

    async setEnableRule(enable) {
        this.config.enableRule = enable
        await this.saveConfig()
        return enable
    }

    async setEnableHost(enable) {
        this.config.enableHost = enable
        await this.saveConfig()
        return enable
    }

    async isRuleEnabled() {
        return this.config.enableRule
    }

    async isHostEnabled() {
        return this.config.enableHost
    }

    async saveProjectPath(projectPath: { [key: string]: string }) {
        this.config.projectPath = projectPath
        await this.saveConfig()
    }

    async deleteByName(name: string) {
        this.config.projectPath = <any>pickBy(this.config.projectPath, (_value, key) => key !== name)
        console.log(this.config.projectPath, name)
        await this.saveConfig()
    }
}