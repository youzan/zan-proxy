import EventEmitter from 'events';
import fs from 'fs-extra';
import { cloneDeep, lowerCase, flatMap, filter } from 'lodash';
import path from 'path';
import { Service } from 'typedi';
import uuid from 'uuid/v4';
import URL from 'url';

import { IRule, IRuleAction, IRuleActionData, IRuleFile } from '@core/types/rule';

import { AppInfoService } from './appInfo';
import { request } from '@core/utils';

export const ErrNameExists = new Error('name exists');

@Service()
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
   * 创建转发规则文件
   */
  public async create(name: string, description: string) {
    if (this.rules[name]) {
      return ErrNameExists;
    }
    const ruleFile: IRuleFile = {
      checked: false,
      content: [],
      description,
      meta: {
        ETag: '',
        remote: false,
        remoteETag: '',
        url: '',
      },
      name,
    };
    this.rules[name] = ruleFile;
    // 写文件
    const filePath = this.getRuleFilePath(name);
    await fs.writeJson(filePath, ruleFile, { encoding: 'utf-8' });
    // 发送消息通知
    this.emit('data-change', this.getRuleFileList());
    return true;
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
    delete this.rules[name];

    const ruleFilePath = this.getRuleFilePath(name);
    await fs.remove(ruleFilePath);
    // 发送消息通知
    this.emit('data-change', this.getRuleFileList());
  }

  /**
   * 设置规则文件的使用状态
   */
  public async setRuleFileCheckStatus(name: string, checked: boolean) {
    this.rules[name].checked = checked;
    const ruleFilePath = this.getRuleFilePath(name);
    await fs.writeJson(ruleFilePath, this.rules[name], {
      encoding: 'utf-8',
    });
    // 发送消息通知
    this.emit('data-change', this.getRuleFileList());
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
  public async saveRuleFile(ruleFile: IRuleFile) {
    const originRuleFile = this.rules[ruleFile.name];
    if (originRuleFile) {
      ruleFile.checked = originRuleFile.checked;
      ruleFile.meta = originRuleFile.meta;
    }
    // 写文件
    const filePath = this.getRuleFilePath(ruleFile.name);
    await fs.writeJson(filePath, ruleFile, {
      encoding: 'utf-8',
    });
    this.rules[ruleFile.name] = ruleFile;
    this.emit('data-change', this.getRuleFileList());
  }

  /**
   * 修改规则文件名称
   */
  public async updateFileInfo(
    originName: string,
    {
      name,
      description,
    }: {
      name: string;
      description: string;
    },
  ) {
    const userRuleMap = this.rules;
    if (userRuleMap[name] && name !== originName) {
      throw ErrNameExists;
    }

    const ruleFile = userRuleMap[originName];
    // 删除旧的rule
    delete this.rules[originName];
    const ruleFilePath = this.getRuleFilePath(originName);
    await fs.remove(ruleFilePath);

    // 修改rule名称
    ruleFile.name = name;
    ruleFile.description = description;
    await this.saveRuleFile(ruleFile);
  }

  /**
   * 根据请求,获取处理请求的规则
   */
  public getProcessRule(method: string, urlObj: URL.UrlWithStringQuery) {
    const usingRules = this.usingRules;
    for (const rule of usingRules) {
      // 捕获规则
      if (
        this.isMatchUrl(urlObj.href as string, rule.match) &&
        this.isMatchMethod(method, rule.method)
      ) {
        return rule;
      }
    }
  }

  /**
   * 导入远程转发规则
   */
  public async importRemoteRuleFile(url: string): Promise<IRuleFile> {
    const ruleFile = await this.fetchRemoteRuleFile(url);
    await this.saveRuleFile(ruleFile);
    return ruleFile;
  }

  /**
   * 获取远程转发规则文件内容
   */
  public async fetchRemoteRuleFile(url: string) {
    const response = await request.get(url);
    const responseData = await response.json();
    const ETag = response.headers.get('etag') || '';
    const content = responseData.content.map(remoteRule => {
      if (remoteRule.action && !remoteRule.actionList) {
        remoteRule.actionList = [remoteRule.action];
      }
      const actionList = remoteRule.actionList.map(remoteAction => {
        const actionData: IRuleActionData = {
          dataId: '',
          headerKey: remoteAction.data.headerKey || '',
          headerValue: remoteAction.data.headerValue || '',
          target: remoteAction.data.target || '',
        };
        const action: IRuleAction = {
          data: actionData,
          type: remoteAction.type,
        };
        return action;
      });
      const rule: IRule = {
        actionList,
        checked: remoteRule.checked,
        key: remoteRule.key || uuid(),
        match: remoteRule.match,
        method: remoteRule.method,
        name: remoteRule.name,
      };
      return rule;
    });
    const ruleFile: IRuleFile = {
      checked: false,
      content,
      description: responseData.description,
      meta: {
        ETag,
        remote: true,
        remoteETag: ETag,
        url,
      },
      name: responseData.name,
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
    copied.meta = Object.assign({}, copied.meta, {
      isCopy: true,
      remote: false,
    });
    await this.saveRuleFile(copied);
    return copied;
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
   * 请求的方法是否匹配规则
   */
  private isMatchMethod(reqMethod: string, ruleMethod: string) {
    const loweredReqMethod = lowerCase(reqMethod);
    const loweredRuleMethod = lowerCase(ruleMethod);
    return loweredReqMethod === loweredRuleMethod || !ruleMethod || loweredReqMethod === 'option';
  }

  /**
   * 请求的url是否匹配规则
   */
  private isMatchUrl(reqUrl: string, ruleMatchStr: string) {
    return (
      ruleMatchStr && (reqUrl.indexOf(ruleMatchStr) >= 0 || new RegExp(ruleMatchStr).test(reqUrl))
    );
  }
}
