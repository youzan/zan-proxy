import { isJson } from '@core/utils';
import { Context } from 'koa';
import { Ctx, Get, Post, JsonController } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { HttpTrafficService } from '../../services';

@Service()
@JsonController('/traffic')
export class HttpTrafficController {
  @Inject() private httpTrafficService: HttpTrafficService;

  // 获取响应body
  @Get('/getResponseBody')
  public async getResponseBody(@Ctx() ctx: Context) {
    const id = ctx.query.id;
    const content = await this.httpTrafficService.getResponseBody(id);
    return content ? (isJson(content) ? JSON.stringify(content) : content) : null;
  }

  @Get('/getRequestBody')
  public async getRequestBody(@Ctx() ctx: Context) {
    const id = ctx.query.id;
    const content = await this.httpTrafficService.getRequestBody(id);
    return content ? (isJson(content) ? JSON.stringify(content) : content) : null;
  }

  @Post('/clear')
  public async clear(@Ctx() ctx: Context) {
    await this.httpTrafficService.clear();
    return true;
  }
}
