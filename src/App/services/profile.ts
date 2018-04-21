import { promisify } from 'es6-promisify';
import EventEmitter from 'events';
import fs from 'fs';
import jsonfile from 'jsonfile';
import { forEach, template } from 'lodash';
import path from 'path';
import { Service } from 'typedi';
import { AppInfoService } from './appInfo';

const jsonfileWriteFile = promisify(jsonfile.writeFile);

export interface Profile {
  projectPath: object;
  enableRule: boolean;
  enableHost: boolean;
}

const defaultProfile: Profile = {
  // 是否启用host解析
  enableHost: true,
  // 是否启用转发规则
  enableRule: true,
  // 工程路径配置
  projectPath: {},
};
/**
 * 代理运转需要的规则数据
 * 代理端口、超时时间、gitlab token、工程路径、是否启用转发规则
 * Created by tsxuehu on 8/3/17.
 */
@Service()
export class ProfileService extends EventEmitter {
  private userProfileMap: object;
  private clientIpUserMap: object;
  private profileSaveDir: string;
  private clientIpUserMapSaveFile: string;
  constructor(appInfoService: AppInfoService) {
    super();
    // userId -> profile
    this.userProfileMap = {};
    // clientIp -> userId
    this.clientIpUserMap = {};

    const proxyDataDir = appInfoService.getProxyDataDir();
    this.profileSaveDir = path.join(proxyDataDir, 'profile');
    this.clientIpUserMapSaveFile = path.join(
      proxyDataDir,
      'clientIpUserMap.json',
    );

    const profileMap = fs
      .readdirSync(this.profileSaveDir)
      .filter(name => name.endsWith('.json'))
      .reduce((prev, curr) => {
        prev[curr] = jsonfile.readFileSync(
          path.join(this.profileSaveDir, curr),
        );
        return prev;
      }, {});
    forEach(profileMap, (profile, fileName) => {
      const userId = fileName.slice(0, -5);
      // 补全profile数据
      // this.userProfileMap[userId] = assign({}, defaultProfile, profile);;
      this.userProfileMap[userId] = profile;
    });
    // 加载ip-> userID映射
    this.clientIpUserMap = jsonfile.readFileSync(this.clientIpUserMapSaveFile);
  }

  public getProfile(userId) {
    return this.userProfileMap[userId] || defaultProfile;
  }

  public async setProfile(userId, profile) {
    this.userProfileMap[userId] = profile;

    const filePath = path.join(this.profileSaveDir, `${userId}.json`);
    // 将数据写入文件
    await jsonfileWriteFile(filePath, profile, { encoding: 'utf-8' });
    // 发送通知
    this.emit('data-change-profile', userId, profile);
  }

  /**
   * 替换redirect中的变量引用,
   * 如果引用的变量不存在，则不做替换
   * @param clientIp
   * @param href
   * @param match
   * @param target
   */
  public calcPath(userId, href, match, target) {
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
      const projectPath = this.getProfile(userId).projectPath;
      // 解析应用的变量
      return compiled(projectPath);
    }
  }

  /**
   *
   * @param userId
   * @param enable
   */
  public async setEnableRule(userId, enable) {
    const conf = this.getProfile(userId);
    conf.enableRule = enable;
    await this.setProfile(userId, conf);
  }

  public async setEnableHost(userId, enable) {
    const conf = this.getProfile(userId);
    conf.enableHost = enable;
    await this.setProfile(userId, conf);
  }

  /**
   * 获取转发规则启用开关
   * @param clientIp
   */
  public enableRule(userId) {
    return this.getProfile(userId).enableRule;
  }

  public enableHost(userId) {
    return this.getProfile(userId).enableHost;
  }

  // 获取clientIp对应的user id
  public getClientIpMappedUserId(clientIp) {
    return this.clientIpUserMap[clientIp] || 'root';
  }

  // 将ip绑定至用户
  public async bindClientIp(userId, clientIp) {
    const originUserId = this.clientIpUserMap[clientIp];
    this.clientIpUserMap[clientIp] = userId;

    await jsonfileWriteFile(
      this.clientIpUserMapSaveFile,
      this.clientIpUserMap,
      { encoding: 'utf-8' },
    );

    const clientIpList = this.getClientIpsMappedToUserId(userId);
    this.emit('data-change-clientIpUserMap', userId, clientIpList);

    if (originUserId) {
      const originClientIpList = this.getClientIpsMappedToUserId(originUserId);
      this.emit(
        'data-change-clientIpUserMap',
        originUserId,
        originClientIpList,
      );
    }
  }

  // 获取用户绑定的clientip
  public getClientIpsMappedToUserId(userId) {
    const ips: string[] = [];
    forEach(this.clientIpUserMap, (mapedUserId, ip) => {
      if (mapedUserId === userId) {
        ips.push(ip);
      }
    });
    return ips;
  }
}
