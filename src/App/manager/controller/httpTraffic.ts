import { Inject, Service } from 'typedi';
import { HttpTrafficService } from '../../services';

@Service()
export class HttpTrafficController {
  @Inject()
  private httpTrafficService: HttpTrafficService;
  public regist(router) {
    // 获取响应body
    router.get('/traffic/getResponseBody', async ctx => {
      const userId = ctx.userId;
      const id = ctx.query.id;
      const content = await this.httpTrafficService.getResponseBody(userId, id);
      ctx.body = content;
    });

    router.get('/traffic/getRequestBody', async ctx => {
      const userId = ctx.userId;
      const id = ctx.query.id;
      const content = await this.httpTrafficService.getRequestBody(userId, id);
      ctx.body = content;
    });

    router.get('/traffic/stopRecord', async ctx => {
      const userId = ctx.userId;
      const stopRecord = ctx.query.stop;
      await this.httpTrafficService.setStopRecord(
        userId,
        stopRecord.toString() === 'true',
      );
      ctx.body = {
        code: 0,
      };
    });
    router.get('/traffic/setfilter', async ctx => {
      const userId = ctx.userId;
      const { filter = '' } = ctx.query;
      await this.httpTrafficService.setFilter(userId, filter);
      ctx.body = {
        code: 0,
      };
    });

    router.get('/traffic/clear', async ctx => {
      const userId = ctx.userId;
      await this.httpTrafficService.clear(userId);
      ctx.body = {
        code: 0,
      };
    });

    // 获取请求body
    router.get('/traffic/getRequestBody', async ctx => {
      const userId = ctx.userId;
      const id = ctx.query.id;
      const content = await this.httpTrafficService.getRequestBody(userId, id);
      ctx.body = content;
    });
  }
}
