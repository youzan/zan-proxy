import { Context } from 'koa';
import { Ctx, Get, Post, Delete, HttpError, JsonController } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { HostService } from '../../services';

@Service()
@JsonController('/host')
export class HostController {
  @Inject() private hostService: HostService;

  @Post('/create')
  public async create(@Ctx() ctx: Context) {
    const success = await this.hostService.create(ctx.request.body);

    if (success) {
      return true;
    } else {
      throw new HttpError(409, '文件已存在');
    }
  }

  @Get('/list')
  public async list(@Ctx() ctx: Context) {
    const hostList = await this.hostService.getHostFileList();
    return hostList;
  }

  @Delete('/delete')
  public async delete(@Ctx() ctx: Context) {
    this.hostService.deleteHostFile(ctx.query.name);
    return true;
  }

  @Post('/toggle')
  public async toggle(@Ctx() ctx: Context) {
    const { name } = ctx.query;
    await this.hostService.toggleHost(name);
    return true;
  }

  @Get('/get')
  public async get(@Ctx() ctx: Context) {
    const hostFile = await this.hostService.getHostFile(ctx.query.name);
    return hostFile;
  }

  @Post('/save')
  public async save(@Ctx() ctx: Context) {
    await this.hostService.saveHostFile(ctx.query.name, ctx.request.body);
    return true;
  }

  @Get('/download')
  public async download(@Ctx() ctx: Context) {
    const name = ctx.query.name;
    const content = await this.hostService.getHostFile(name);
    ctx.attachment(`${name}.json`);
    return content;
  }

  @Post('/import')
  public async import(@Ctx() ctx: Context) {
    const { query } = ctx;
    const hostFileUrl = query.url;
    const hostFile = await this.hostService.importRemoteHostFile(hostFileUrl);
    return hostFile;
  }
}
