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
    const id = ctx.query.id;
    const content = await this.httpTrafficService.getResponseBody(id);
    return content;
  }

  @Get('/getRequestBody')
  public async getRequestBody(@Ctx() ctx: Context) {
    const id = ctx.query.id;
    const content = await this.httpTrafficService.getRequestBody(id);
    return content;
  }

  @Get('/stopRecord')
  public async stopRecord(@Ctx() ctx: Context) {
    const stopRecord = ctx.query.stop;
    await this.httpTrafficService.setStopRecord(stopRecord.toString() === 'true');
    return {
      code: 0,
    };
  }

  @Get('/setfilter')
  public async setFilter(@Ctx() ctx: Context) {
    const { filter = '' } = ctx.query;
    this.httpTrafficService.setFilter(filter);
    return {
      code: 0,
    };
  }

  @Get('/clear')
  public async clear(@Ctx() ctx: Context) {
    await this.httpTrafficService.clear();
    return {
      code: 0,
    };
  }
}
