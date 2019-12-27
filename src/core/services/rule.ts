import EventEmitter from 'events';
import fs from 'fs-extra';
import { cloneDeep, filter, flatMap, lowerCase, pick } from 'lodash';
import path from 'path';
import { HttpError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import URL from 'url';
import uuid from 'uuid/v4';

import { IRule, IRuleAction, IRuleFile } from '@core/types/rule';
import { request } from '@core/utils';

import { AppInfoService } from './appInfo';

@Service()
@Service('RuleService')
export class RuleService extends EventEmitter {
  private ruleSaveDir: string;

  public rules: { [name: string]: IRuleFile };

  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.proxyDataDir;
    this.ruleSaveDir = path.join(proxyDataDir, 'rule');

    this.rules = fs
      .readdirSync(this.ruleSaveDir)
      .filter(name => name.endsWith('.json'))
      .reduce((map, curr) => {
        try {
          const content: IRuleFile = fs.readJsonSync(path.join(this.ruleSaveDir, curr));
          map[content.name] = content;
        } catch (e) {
          // ignore
        }
        return map;
      }, {});
  }

  private exist(name: string) {
    return !!this.rules[name];
  }

  /**
   * 正在使用中的转发规则
   */
  private get usingRules() {
    return flatMap(this.rules, (file, filename) => {
      // 转发规则未被选中
      if (!file.checked) {
        return [];
      }
      return filter(file.content, rule => rule.checked);
    });
  }

  /**
   * 获取转发规则文件路径
   */
  private getRuleFilePath(name: string) {
    const fileName = `${name}.json`;
    const filePath = path.join(this.ruleSaveDir, fileName);
    return filePath;
  }

  /**
   * 创建转发规则文件
   */
  public async create(name: string, description: string) {
    if (this.exist(name)) {
      throw new HttpError(409, '规则集名称已存在');
    }

    const ruleFile: IRuleFile = {
      name,
      meta: {
        remote: false,
        url: '',
      },
      description,
      checked: false,
      content: [],
    };
    await this.saveRuleFile(name, ruleFile);
  }

  /**
   * 返回规则列表
   */
  public getRuleFileList() {
    return Object.values(this.rules);
  }

  /**
   * 删除规则文件
   */
  public async deleteRuleFile(name: string) {
    if (!this.exist(name)) {
      throw new NotFoundError('找不到对应名称的转发规则集');
    }

    delete this.rules[name];

    const filePath = this.getRuleFilePath(name);
    const exists = await fs.pathExists(filePath);
    if (exists) {
      await fs.remove(filePath);
    }
    // 发送消息通知
    this.emit('data-change', this.getRuleFileList());
  }

  /**
   * 设置规则文件的使用状态
   */
  public async toggleRuleFile(name: string, checked: boolean) {
    if (!this.exist(name)) {
      throw new NotFoundError('找不到对应名称的转发规则集');
    }

    const ruleFile = this.rules[name];
    ruleFile.checked = checked;
    await this.saveRuleFile(name, ruleFile);
  }

  /**
   * 获取规则文件的内容
   */
  public getRuleFile(name: string) {
    return this.rules[name];
  }

  /**
   * 保存规则文件(可能是远程、或者本地)
   */
  public async saveRuleFile(name: string, ruleFile: IRuleFile) {
    this.rules[name] = ruleFile;

    // 写文件
    const filePath = this.getRuleFilePath(name);
    await fs.writeJson(filePath, ruleFile, {
      encoding: 'utf-8',
    });
    this.emit('data-change', this.getRuleFileList());
  }

  /**
   * 修改规则文件名称
   */
  public async updateRuleInfo(
    originName: string,
    {
      name,
      description,
    }: {
      name: string;
      description: string;
    },
  ) {
    if (name !== originName && this.rules[name]) {
      throw new HttpError(409, '规则集名称已存在');
    }

    const ruleFile = this.rules[originName];
    if (name !== originName) {
      await this.deleteRuleFile(originName);
    }

    // 修改 rule 内容
    ruleFile.name = name;
    ruleFile.description = description;
    await this.saveRuleFile(name, ruleFile);
  }

  /**
   * 根据请求,获取处理请求的规则
   */
  public getProcessRule(method: string, urlObj: URL.UrlWithStringQuery) {
    const usingRules = this.usingRules;

    /**
     * 请求的方法是否匹配规则
     */
    const isMatchMethod = (reqMethod: string, ruleMethod: string) => {
      const loweredReqMethod = lowerCase(reqMethod);
      const loweredRuleMethod = lowerCase(ruleMethod);
      return loweredReqMethod === loweredRuleMethod || !ruleMethod || loweredReqMethod === 'option';
    };

    /**
     * 请求的url是否匹配规则
     */
    const isMatchUrl = (reqUrl: string, ruleMatchStr: string) => {
      return ruleMatchStr && (reqUrl.indexOf(ruleMatchStr) >= 0 || new RegExp(ruleMatchStr).test(reqUrl));
    };

    for (const rule of usingRules) {
      // 捕获规则
      if (isMatchUrl(urlObj.href as string, rule.match) && isMatchMethod(method, rule.method)) {
        return rule;
      }
    }
  }

  /**
   * 导入远程转发规则
   */
  public async importRemoteRuleFile(url: string): Promise<IRuleFile> {
    const ruleFile = await this.fetchRemoteRuleFile(url);
    await this.saveRuleFile(ruleFile.name, ruleFile);
    return ruleFile;
  }

  /**
   * 获取远程转发规则文件内容
   */
  public async fetchRemoteRuleFile(url: string) {
    const response = await request.get(url);
    const responseData: IRuleFile = await response.json();

    const content = responseData.content.map<IRule>(remoteRule => {
      const actionList = remoteRule.actionList.map<IRuleAction>(remoteAction => pick(remoteAction, ['type', 'data']));

      return {
        key: remoteRule.key || uuid(),
        name: remoteRule.name,
        checked: remoteRule.checked,
        match: remoteRule.match,
        method: remoteRule.method,
        actionList,
      };
    });

    const ruleFile: IRuleFile = {
      name: responseData.name,
      meta: {
        remote: true,
        url,
      },
      description: responseData.description,
      checked: false,
      content,
    };
    return ruleFile;
  }

  /**
   * 拷贝转发规则
   */
  public async copyRuleFile(name: string) {
    const ruleFile = this.getRuleFile(name);
    if (!ruleFile) {
      return;
    }
    const copied = cloneDeep(ruleFile);
    copied.checked = false;
    copied.name = `${copied.name}-复制`;
    copied.meta = {
      remote: false,
    };
    await this.saveRuleFile(copied.name, copied);
    return copied;
  }
}
