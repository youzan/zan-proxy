import { Token } from 'typedi';
import { HasAsyncInit } from './hasAsyncInit'

export interface Rule {
    name: string
    key: string,
    method: string,
    match: string,
    checked: boolean,
    actionList?: Array<RuleAction>
}

export interface RuleAction {
    type: string,
    data?: RuleActionData,
}

export interface RuleActionData {
    target?: string,
    dataId?: string,
    headerKey?: string,
    headerValue?: string
}

export interface RuleFile {
    meta: RuleFileMeta
    checked: boolean
    name: string
    description: string
    content: Array<Rule>
}

export interface RuleFileMeta {
    remote: boolean
    url?: string
    ETag?: string,
    remoteETag?: string
}

export interface RuleService extends HasAsyncInit {
    createRuleFile(name: string, description: string, content?): Promise<RuleFile>
    getRuleFileList(): Promise<Array<RuleFile>>
    deleteRuleFile(name: string): Promise<RuleFile | undefined>
    setRuleFileCheckStatus(name: string, checked: string): Promise<RuleFile | undefined>
    getRuleFile(name: string): Promise<RuleFile | undefined>
    saveRuleFile(name: string, content: Array<Rule>): Promise<RuleFile>
    getProcessRule(method: string, href: string): Promise<Rule | undefined>
}

export const RuleServiceToken = new Token<RuleService>('service.Rule')