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
@Service('ProfileService')
export class ProfileService extends EventEmitter {
  /**
   * 用户配置信息映射表
   */
  private profile: IProfile = DEFAULT_PROFILE;

  /**
   * 配置信息存储文件路径
   */
  private profileSaveFile: string;

  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.proxyDataDir;
    this.profileSaveFile = path.join(proxyDataDir, 'profile.json');

    try {
      this.profile = fs.readJsonSync(this.profileSaveFile);
    } catch (err) {
      console.error('read profile file failed:', err);
    }
  }

  /**
   * 获取配置信息
   */
  public getProfile() {
    return this.profile;
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

  public get customProxy() {
    return this.getProfile().customProxy;
  }

  /**
   * 更新配置信息
   */
  private async setProfile(profile: IProfile) {
    this.profile = profile;

    // 将数据写入文件
    await fs.writeJSON(this.profileSaveFile, profile, { encoding: 'utf-8' });
    // 发送通知
    this.emit('data-change', this.profile);
  }

  /**
   * 修改环境变量
   */
  public async setProjectPath(projectPath: IProfile['projectPath']) {
    const profile = this.getProfile();
    profile.projectPath = projectPath;
    await this.setProfile(profile);
  }

  /**
   * 启用或关闭转发规则
   */
  public async setEnableRule(enable: boolean) {
    const profile = this.getProfile();
    profile.enableRule = enable;
    await this.setProfile(profile);
  }

  /**
   * 启用或关闭host规则
   */
  public async setEnableHost(enable: boolean) {
    const profile = this.getProfile();
    profile.enableHost = enable;
    await this.setProfile(profile);
  }

  /**
   * 设置自定义二次代理服务器
   */
  public async setCustomProxsy(customProxy: string) {
    const profile = this.getProfile();
    profile.customProxy = customProxy;
    await this.setProfile(profile);
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
