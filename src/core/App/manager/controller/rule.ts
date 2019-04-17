import { Context } from 'koa';
import { Controller, Ctx, Get, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { ErrNameExists, ProfileService, RuleService } from '../../services';

@Service()
@Controller('/rule')
export class RuleController {
  @Inject() private ruleService: RuleService;
  @Inject() private profileService: ProfileService;

  @Post('/create')
  public async create(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    try {
      const result = await this.ruleService.createRuleFile(
        userId,
        ctx.request.body.name,
        ctx.request.body.description,
      );
      return {
        code: 0,
        msg: result,
      };
    } catch (error) {
      const msg = error === ErrNameExists ? '文件已存在' : `未知错误: ${error.toString()}`;
      return {
        code: 1,
        msg,
      };
    }
  }

  // 获取规则文件列表
  @Get('/filelist')
  public async fileList(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const ruleFileList = await this.ruleService.getRuleFileList(userId);
    return {
      code: 0,
      list: ruleFileList,
    };
  }

  // 删除规则文件
  @Get('/deletefile')
  public async deleteFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    await this.ruleService.deleteRuleFile(userId, ctx.query.name);
    return {
      code: 0,
    };
  }

  // 设置文件勾选状态
  @Get('/setfilecheckstatus')
  public async setFileCheckStatus(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    this.ruleService.setRuleFileCheckStatus(
      userId,
      ctx.query.name,
      parseInt(ctx.query.checked, 10) === 1 ? true : false,
    );
    return {
      code: 0,
    };
  }

  // 获取规则文件
  @Get('/getfile')
  public async getFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const content = await this.ruleService.getRuleFile(userId, ctx.query.name);
    return {
      code: 0,
      data: content,
    };
  }

  // 保存规则文件
  @Post('/savefile')
  public async saveFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    await this.ruleService.saveRuleFile(userId, ctx.request.body);
    return {
      code: 0,
    };
  }

  // 重命名规则文件
  @Post('/updatefileinfo/:origin')
  public async updateFileInfo(@Ctx() ctx: Context) {
    const { userId, params, request } = ctx;
    const { origin } = params;
    const { name, description } = request.body;
    try {
      await this.ruleService.updateFileInfo(userId, origin, {
        description,
        name,
      });
      return {
        code: 0,
      };
    } catch (e) {
      const msg = e === ErrNameExists ? '有重复名字' : `未知错误: ${e.toString()}`;
      return {
        code: 1,
        msg,
      };
    }
  }

  // 导出规则文件
  @Get('/download')
  public async download(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const name = ctx.query.name;
    const content = await this.ruleService.getRuleFile(userId, name);
    ctx.set('Content-disposition', `attachment;filename=${encodeURI(name)}.json`);
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
      code: 0,
      data: {
        matchRlt,
        targetRlt,
      },
    };
  }

  @Get('/import')
  public async import(@Ctx() ctx: Context) {
    const { userId, query } = ctx;
    const ruleFileUrl = query.url;
    try {
      const ruleFile = await this.ruleService.importRemoteRuleFile(userId, ruleFileUrl);
      return {
        code: 0,
        data: ruleFile,
      };
    } catch (e) {
      return {
        code: 1,
        msg: e,
      };
    }
  }

  @Get('/copy')
  public async copy(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const name = ctx.query.name;
    const copied = await this.ruleService.copyRuleFile(userId, name);
    return {
      code: 0,
      data: copied,
    };
  }
}
