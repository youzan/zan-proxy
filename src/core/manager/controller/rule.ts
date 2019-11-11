import { IRuleTest } from '@core/types/rule';
import { Context } from 'koa';
import { Ctx, Delete, Get, JsonController, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { ProfileService, RuleService } from '../../services';

@Service()
@JsonController('/rule')
export class RuleController {
  @Inject() private ruleService: RuleService;
  @Inject() private profileService: ProfileService;

  @Post('/create')
  public async create(@Ctx() ctx: Context) {
    const {
      request: { body },
    } = ctx;
    await this.ruleService.create(body.name, body.description);
    return true;
  }

  // 获取规则文件列表
  @Get('/list')
  public async list(@Ctx() ctx: Context) {
    const ruleFileList = this.ruleService.getRuleFileList();
    return ruleFileList;
  }

  // 删除规则文件
  @Delete('/delete')
  public async delete(@Ctx() ctx: Context) {
    const { query } = ctx;
    await this.ruleService.deleteRuleFile(query.name);
    return true;
  }

  // 设置文件启用状态
  @Post('/toggle')
  public async toggle(@Ctx() ctx: Context) {
    const {
      request: { body },
    } = ctx;
    await this.ruleService.toggleRuleFile(body.name, body.enable);
    return true;
  }

  // 获取规则文件
  @Get('/get')
  public async get(@Ctx() ctx: Context) {
    const { query } = ctx;
    const content = this.ruleService.getRuleFile(query.name);
    return content;
  }

  // 更新规则文件
  @Post('/save')
  public async save(@Ctx() ctx: Context) {
    const { request, query } = ctx;
    await this.ruleService.saveRuleFile(query.name, request.body);
    return true;
  }

  // 重命名规则文件
  @Post('/update/info')
  public async updateRuleInfo(@Ctx() ctx: Context) {
    const { request } = ctx;
    const { originName, updateInfo } = request.body;
    await this.ruleService.updateRuleInfo(originName, updateInfo);
    return true;
  }

  // 导出规则文件
  @Get('/download')
  public async download(@Ctx() ctx: Context) {
    const name = ctx.query.name;
    const content = this.ruleService.getRuleFile(name);
    ctx.attachment(`${name}.json`);
    return content;
  }

  // 测试规则
  @Post('/test')
  public async test(@Ctx() ctx: Context) {
    const {
      request: { body },
    } = ctx;
    const { match, url, targetTpl } = body as IRuleTest;

    if (match && (url.indexOf(match) >= 0 || new RegExp(match).test(url))) {
      const targetRlt = this.profileService.calcPath(url, match, targetTpl);
      // 测试规则
      return {
        matchRlt: 'url匹配通过',
        targetRlt,
      };
    }

    return {
      matchRlt: '不匹配',
      targetRlt: '',
    };
  }

  @Post('/import')
  public async import(@Ctx() ctx: Context) {
    const {
      request: { body },
    } = ctx;
    const ruleFileUrl = body.url;
    const ruleFile = await this.ruleService.importRemoteRuleFile(ruleFileUrl);
    return ruleFile;
  }

  @Post('/copy')
  public async copy(@Ctx() ctx: Context) {
    const {
      request: { body },
    } = ctx;
    const { name } = body;
    const copied = await this.ruleService.copyRuleFile(name);
    return copied;
  }
}
