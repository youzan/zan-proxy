import { EventEmitter } from 'events'
import { Service, Inject } from 'typedi'
import { find } from 'lodash'
import { RuleService as IRuleService, RuleServiceToken, Storage, RuleStorageToken, RuleFile, Rule } from '../../service'

const storageKey = '$$RULE_FILES$$'

@Service({
    id: RuleServiceToken
})
export class RuleService extends EventEmitter implements IRuleService {
    @Inject(RuleStorageToken) storage: Storage
    ruleFiles: Array<RuleFile>
    activeRules: Array<Rule>

    async init() {
        this.ruleFiles = await this.storage.get(storageKey) || []
        this.resetActiveRules()
    }

    resetActiveRules() {
        this.activeRules = this.ruleFiles
            .filter(ruleFile => ruleFile.checked)
            .map(ruleFile => ruleFile.content)
            .reduce((prev, curr) => {
                return prev.concat(curr)
            }, [])
            .filter(rule => rule.checked)
    }

    async createRuleFile(name, description, content?) {
        const ruleFile: RuleFile = {
            name,
            description,
            meta: {
                remote: false,
                url: '',
                ETag: '',
                remoteETag: ''
            },
            checked: true,
            content: content || []
        }
        this.ruleFiles.push(ruleFile)
        await this.saveRuleFiles()
        return ruleFile
    }
    async getRuleFileList() {
        return this.ruleFiles
    }
    async deleteRuleFile(name) {
        const ruleFile = this.getRuleFile(name)
        this.ruleFiles = this.ruleFiles
            .filter(file => file.name !== name)
        await this.saveRuleFiles()
        return ruleFile
    }
    async setRuleFileCheckStatus(name, checked) {
        const ruleFile = await this.getRuleFile(name)
        if (!ruleFile) {
            return
        }
        ruleFile.checked = checked
        await this.saveRuleFiles()
        return ruleFile
    }
    async getRuleFile(name) {
        const ruleFile = this.ruleFiles
            .filter(file => file.name === name)[0]
        return ruleFile
    }
    async saveRuleFile(name ,content) {
        const ruleFile = await this.getRuleFile(name)
        ruleFile.content = content
        await this.saveRuleFiles()
        return ruleFile
    }
    async getProcessRule(method: string, href: string) {
        const rules = this.activeRules.filter(rule => {
            // 所有方法
            if (!rule.method) {
                return true
            }
            if (rule.method.toUpperCase() === method.toUpperCase()) {
                return true
            }
            if (method.toUpperCase() === 'OPTION') {
                return true
            }
            return false
        })
        let rule
        rule = find(rules, r => r.match === href)
        if (rule) {
            return rule
        }
        rule = find(rule, r => r.match.includes(href))
        if (rule) {
            return rule
        }
        rule = find(rules, r => new RegExp(r.match).test(href))
        return rule
    }
    async saveRuleFiles() {
        await this.storage.set(storageKey, this.ruleFiles)
        this.resetActiveRules()
        this.emit('data-change', this.ruleFiles)
    }
}