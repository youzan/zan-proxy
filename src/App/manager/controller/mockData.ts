import { Inject, Service } from 'typedi';
import { HttpTrafficService, MockDataService } from '../../services';

/**
 * Created by tsxuehu on 4/11/17.
 */

/**
 * 数据文件相关api
 */
@Service()
export class MockDataController {
  @Inject()
  private mockDataService: MockDataService;
  @Inject()
  private httpTrafficService: HttpTrafficService;

  public regist(router) {
    // 获取mock数据列表
    router.get('/data/getdatalist', async ctx => {
      const userId = ctx.userId;
      const dataList = await this.mockDataService.getMockDataList(userId);
      ctx.body = {
        code: 0,
        data: dataList,
      };
    });
    // 保存数据列表
    router.post('/data/savedatalist', ctx => {
      const userId = ctx.userId;
      this.mockDataService.saveMockDataList(userId, ctx.request.body);
      ctx.body = {
        code: 0,
      };
    });

    // 读取数据文件
    router.get('/data/getdatafile', async ctx => {
      const userId = ctx.userId;
      const content = await this.mockDataService.getDataFileContent(
        userId,
        ctx.query.id,
      );
      ctx.body = {
        code: 0,
        data: content,
      };
    });
    // 保存数据文件
    router.post('/data/savedatafile', async ctx => {
      const userId = ctx.userId;
      await this.mockDataService.saveDataFileContent(
        userId,
        ctx.query.id,
        ctx.request.body.content,
      );
      ctx.body = {
        code: 0,
      };
    });
    // 从http请求日志中保存 mock 数据
    router.post('/data/savedatafromtraffic', async ctx => {
      const userId = ctx.userId;

      const content = await this.httpTrafficService.getResponseBody(
        userId,
        ctx.request.body.reqid,
      );
      // 获取数据文件内容 在保存
      await this.mockDataService.saveDataEntryFromTraffic(
        userId,
        ctx.request.body.id,
        ctx.request.body.name,
        ctx.request.body.contenttype,
        content,
      );
      ctx.body = {
        code: 0,
      };
    });
  }
}
