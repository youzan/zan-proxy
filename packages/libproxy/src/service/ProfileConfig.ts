import { Token } from 'typedi'
import { HasAsyncInit } from './hasAsyncInit'

export interface ProfileConfig {
    projectPath: {
        [key: string]: string
    },
    enableRule: boolean
    enableHost: boolean
}

export interface ProfileConfigService extends HasAsyncInit {
    getProfile(): Promise<ProfileConfig>
    setProfile(profile: ProfileConfig): Promise<ProfileConfig>
    calcPath(href: string, match: string, target: string): Promise<string>
    setEnableRule(enable): Promise<boolean>
    setEnableHost(enable): Promise<boolean>
    isRuleEnabled(): Promise<boolean>
    isHostEnabled(): Promise<boolean>
    saveProjectPath(projectPath: { [key: string]: string }): Promise<any>
    deleteByName(name: string): Promise<any>
}

export const ProfileConfigServiceToken = new Token<ProfileConfigService>('service.ProfileConfig')