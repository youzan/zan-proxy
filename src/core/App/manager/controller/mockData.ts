import { Context } from 'koa';
import { Controller, Ctx, Get, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { HttpTrafficService, MockDataService } from '../../services';

/**
 * Created by tsxuehu on 4/11/17.
 */

/**
 * 数据文件相关api
 */
@Service()
@Controller('/data')
export class MockDataController {
  @Inject() private mockDataService: MockDataService;
  @Inject() private httpTrafficService: HttpTrafficService;

  // 获取mock数据列表
  @Get('/getdatalist')
  public async getDataList(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const dataList = await this.mockDataService.getMockDataList(userId);
    return {
      code: 0,
      data: dataList,
    };
  }

  // 保存数据列表
  @Post('/savedatalist')
  public async saveDataList(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    this.mockDataService.saveMockDataList(userId, ctx.request.body);
    return {
      code: 0,
    };
  }

  // 读取数据文件
  @Get('/getdatafile')
  public async getDataFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const content = await this.mockDataService.getDataFileContent(userId, ctx.query.id);
    return {
      code: 0,
      data: content,
    };
  }

  // 保存数据文件
  @Post('/savedatafile')
  public async saveDataFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    await this.mockDataService.saveDataFileContent(userId, ctx.query.id, ctx.request.body.content);
    return {
      code: 0,
    };
  }

  // 从http请求日志中保存 mock 数据
  @Post('/savedatafromtraffic')
  public async savedatafromtraffic(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const content = await this.httpTrafficService.getResponseBody(userId, ctx.request.body.reqid);
    // 获取数据文件内容 在保存
    await this.mockDataService.saveDataEntryFromTraffic(
      userId,
      ctx.request.body.id,
      ctx.request.body.name,
      ctx.request.body.contenttype,
      content,
    );
    return {
      code: 0,
    };
  }
}
