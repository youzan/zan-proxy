import { Context } from 'koa';
import { JsonController, Ctx, Get, Post, InternalServerError, Delete } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { ErrNameExists, ProfileService, RuleService } from '../../services';

@Service()
@JsonController('/rule')
export class RuleController {
  @Inject() private ruleService: RuleService;
  @Inject() private profileService: ProfileService;

  @Post('/create')
  public async create(@Ctx() ctx: Context) {
    try {
      const result = await this.ruleService.create(
        ctx.request.body.name,
        ctx.request.body.description,
      );
      return result;
    } catch (error) {
      const msg = error === ErrNameExists ? '文件已存在' : `未知错误: ${error.toString()}`;
      throw new InternalServerError(msg);
    }
  }

  // 获取规则文件列表
  @Get('/list')
  public async fileList(@Ctx() ctx: Context) {
    const ruleFileList = await this.ruleService.getRuleFileList();
    return ruleFileList;
  }

  // 删除规则文件
  @Delete('/delete')
  public async deleteFile(@Ctx() ctx: Context) {
    await this.ruleService.deleteRuleFile(ctx.query.name);
    return true;
  }

  // 设置文件勾选状态
  @Post('/toggle')
  public async toggle(@Ctx() ctx: Context) {
    this.ruleService.setRuleFileCheckStatus(
      ctx.query.name,
      parseInt(ctx.query.checked, 10) === 1 ? true : false,
    );
    return true;
  }

  // 获取规则文件
  @Get('/get')
  public async getFile(@Ctx() ctx: Context) {
    const content = await this.ruleService.getRuleFile(ctx.query.name);
    return content;
  }

  // 保存规则文件
  @Post('/save')
  public async saveFile(@Ctx() ctx: Context) {
    await this.ruleService.saveRuleFile(ctx.request.body);
    return true;
  }

  // 重命名规则文件
  @Post('/update/info/:origin')
  public async updateFileInfo(@Ctx() ctx: Context) {
    const { params, request } = ctx;
    const { origin } = params;
    const { name, description } = request.body;
    try {
      await this.ruleService.updateFileInfo(origin, {
        description,
        name,
      });
      return true;
    } catch (e) {
      const msg = e === ErrNameExists ? '有重复名字' : `未知错误: ${e.toString()}`;
      throw new InternalServerError(msg);
    }
  }

  // 导出规则文件
  @Get('/download')
  public async download(@Ctx() ctx: Context) {
    const name = ctx.query.name;
    const content = await this.ruleService.getRuleFile(name);
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
    const match = ctx.request.body.match;
    const url = ctx.request.body.url;
    let matchRlt = '不匹配';

    if (match && (url.indexOf(match) >= 0 || new RegExp(match).test(url))) {
      matchRlt = 'url匹配通过';
    }

    const targetTpl = ctx.request.body.targetTpl;
    const targetRlt = await this.profileService.calcPath(url, match, targetTpl);

    // 测试规则
    return {
      matchRlt,
      targetRlt,
    };
  }

  @Get('/import')
  public async import(@Ctx() ctx: Context) {
    const { query } = ctx;
    const ruleFileUrl = query.url;
    const ruleFile = await this.ruleService.importRemoteRuleFile(ruleFileUrl);
    return ruleFile;
  }

  @Get('/copy')
  public async copy(@Ctx() ctx: Context) {
    const name = ctx.query.name;
    const copied = await this.ruleService.copyRuleFile(name);
    return copied;
  }
}
