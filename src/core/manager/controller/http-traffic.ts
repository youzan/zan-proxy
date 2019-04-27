import { Context } from 'koa';
import { Controller, Ctx, Get, Post } from 'routing-controllers';
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

  @Post('/clear')
  public async clear(@Ctx() ctx: Context) {
    await this.httpTrafficService.resetTrafficId();
    return true;
  }
}
