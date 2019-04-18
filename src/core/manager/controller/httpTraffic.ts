import { Context } from 'koa';
import { Controller, Ctx, Get } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { HttpTrafficService } from '../../services';

@Service()
@Controller('/traffic')
export class HttpTrafficController {
  @Inject() private httpTrafficService: HttpTrafficService;

  // 获取响应body
  @Get('/getResponseBody')
  public async getResponseBody(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const id = ctx.query.id;
    const content = await this.httpTrafficService.getResponseBody(userId, id);
    return content;
  }

  @Get('/getRequestBody')
  public async getRequestBody(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const id = ctx.query.id;
    const content = await this.httpTrafficService.getRequestBody(userId, id);
    return content;
  }

  @Get('/stopRecord')
  public async stopRecord(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const stopRecord = ctx.query.stop;
    await this.httpTrafficService.setStopRecord(userId, stopRecord.toString() === 'true');
    return {
      code: 0,
    };
  }

  @Get('/setfilter')
  public async setFilter(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const { filter = '' } = ctx.query;
    await this.httpTrafficService.setFilter(userId, filter);
    return {
      code: 0,
    };
  }

  @Get('/clear')
  public async clear(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    await this.httpTrafficService.clear(userId);
    return {
      code: 0,
    };
  }
}
