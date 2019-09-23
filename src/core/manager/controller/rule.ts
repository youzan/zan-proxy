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
    const result = await this.ruleService.create(body.name, body.description);
    return result;
  }

  // 获取规则文件列表
  @Get('/list')
  public async list(@Ctx() ctx: Context) {
    const ruleFileList = this.ruleService.getRuleFileList();
    return ruleFileList;
  }

  // 删除规则文件
  @Delete('/delete')
  public async deleteFile(@Ctx() ctx: Context) {
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
    await this.ruleService.setRuleFileChecked(body.name, body.checked);
    return true;
  }

  // 获取规则文件
  @Get('/get')
  public async getFile(@Ctx() ctx: Context) {
    const { query } = ctx;
    const content = this.ruleService.getRuleFile(query.name);
    return content;
  }

  // 更新规则文件
  @Post('/update')
  public async updateFile(@Ctx() ctx: Context) {
    const { request } = ctx;
    await this.ruleService.updateRuleFile(request.body);
    return true;
  }

  // 重命名规则文件
  @Post('/update/info/:origin')
  public async updateFileInfo(@Ctx() ctx: Context) {
    const { params, request } = ctx;
    const { origin } = params;
    const { name, description } = request.body;
    await this.ruleService.updateFileInfo(origin, {
      description,
      name,
    });
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
    /*
             url: '',// 请求url
             match: '',// url匹配规则
             targetTpl: '',// 路径模板， 会用urlReg的匹配结果来替换targetTpl $1 $2
             matchRlt: '',// url匹配结果
             targetRlt: ''// 路径匹配结果
             */
    const {
      request: { body },
    } = ctx;
    const { match, url, targetTpl } = body as IRuleTest;
    let matchRlt = '不匹配';

    if (match && (url.indexOf(match) >= 0 || new RegExp(match).test(url))) {
      matchRlt = 'url匹配通过';
    }

    const targetRlt = this.profileService.calcPath(url, match, targetTpl);

    // 测试规则
    return {
      matchRlt,
      targetRlt,
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
