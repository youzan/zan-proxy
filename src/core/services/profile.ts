import EventEmitter from 'events';
import fs from 'fs-extra';
import { forEach, template } from 'lodash';
import path from 'path';
import { Service } from 'typedi';

import { AppInfoService } from './appInfo';
import { IProfile } from '../types/profile';

const DEFAULT_PROFILE: IProfile = {
  enableHost: true,
  enableRule: true,
  projectPath: {},
};

/**
 * 配置是否启用host解析、转发规则及工程路径
 */
@Service()
export class ProfileService extends EventEmitter {
  /**
   * 用户配置信息映射表，目前 user 只有 root 一个
   */
  private profile: IProfile;

  /**
   * 配置信息存储目录
   */
  private profileSaveFile: string;

  constructor(appInfoService: AppInfoService) {
    super();

    const proxyDataDir = appInfoService.proxyDataDir;
    // 修改为单用户模式，但是为了保证兼容，需要使用之前的配置保存文件路径
    this.profileSaveFile = path.join(proxyDataDir, 'profile.json');

    try {
      this.profile = fs.readJsonSync(this.profileSaveFile);
    } catch {
      this.profile = DEFAULT_PROFILE;
    }
  }

  /**
   * 获取配置信息
   */
  public getProfile() {
    return this.profile || DEFAULT_PROFILE;
  }

  /**
   * 获取转发规则启用开关
   */
  public get enableRule() {
    return this.getProfile().enableRule;
  }

  /**
   * 获取 host 解析启用开关
   */
  public get enableHost() {
    return this.getProfile().enableHost;
  }

  /**
   * 更新配置信息
   */
  public setProfile(profile: IProfile) {
    this.profile = profile;

    // 将数据写入文件
    fs.writeJsonSync(this.profileSaveFile, profile, { encoding: 'utf-8' });
    // 发送通知
    this.emit('data-change', profile);
  }

  public setEnableRule(enable: boolean) {
    const conf = this.getProfile();
    conf.enableRule = enable;
    this.setProfile(conf);
  }

  public setEnableHost(enable: boolean) {
    const conf = this.getProfile();
    conf.enableHost = enable;
    this.setProfile(conf);
  }

  /**
   * 替换redirect中的变量引用,
   * 如果引用的变量不存在，则不做替换
   */
  public calcPath(href: string, match: string, target: string) {
    if (match) {
      const matchList = href.match(new RegExp(match));
      forEach(matchList, (value, index) => {
        if (index === 0) {
          return;
        }
        const reg = new RegExp('\\$' + index, 'g');
        if (!value) {
          value = '';
        }
        target = target.replace(reg, value);
      });
      const compiled = template(target);
      const projectPath = this.getProfile().projectPath;
      // 解析应用的变量
      return compiled(projectPath);
    }
  }
}
