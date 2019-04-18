import { Context } from 'koa';
import { Controller, Ctx, Get, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { HostService } from '../../services';

@Service()
@Controller('/host')
export class HostController {
  @Inject() private hostService: HostService;

  @Post('/create')
  public async create(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const result = await this.hostService.createHostFile(
      userId,
      ctx.request.body.name,
      ctx.request.body.description,
    );
    ctx.body = {
      code: result ? 0 : 1,
      msg: result ? '' : '文件已存在',
    };
  }

  @Get('/filelist')
  public async fileList(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const hostList = await this.hostService.getHostFileList(userId);
    return {
      code: 0,
      list: hostList,
    };
  }

  @Get('/deletefile')
  public async deleteFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    this.hostService.deleteHostFile(userId, ctx.query.name);
    return {
      code: 0,
    };
  }

  @Get('/togglefile')
  public async toggleFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const { name } = ctx.query;
    await this.hostService.toggleUseHost(userId, name);
    return {
      code: 0,
    };
  }

  @Get('/getfile')
  public async getFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const hostFile = await this.hostService.getHostFile(userId, ctx.query.name);
    return {
      code: 0,
      data: hostFile,
    };
  }

  @Post('/savefile')
  public async saveFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    await this.hostService.saveHostFile(userId, ctx.query.name, ctx.request.body);
    return {
      code: 0,
    };
  }

  @Post('/download')
  public async download(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const name = ctx.query.name;
    const content = await this.hostService.getHostFile(userId, name);
    ctx.set('Content-disposition', `attachment;filename=${encodeURI(name)}.json`);
    return content;
  }

  @Get('import')
  public async import(@Ctx() ctx: Context) {
    const { userId, query } = ctx;
    const hostFileUrl = query.url;
    try {
      const hostFile = await this.hostService.importRemoteHostFile(userId, hostFileUrl);
      return {
        code: 0,
        data: hostFile,
      };
    } catch (e) {
      return {
        code: 1,
        msg: e,
      };
    }
  }
}
