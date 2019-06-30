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
@Controller('/mock')
export class MockDataController {
  @Inject() private mockDataService: MockDataService;
  @Inject() private httpTrafficService: HttpTrafficService;

  // 获取mock数据列表
  @Get('/list')
  public async getDataList(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const dataList = await this.mockDataService.getMockDataList(userId);
    return dataList;
  }

  // 保存数据列表
  @Post('/list')
  public async saveDataList(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    this.mockDataService.saveMockDataList(userId, ctx.request.body);
    return true;
  }

  // 读取数据文件
  @Get('/data')
  public async getDataFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    const content = await this.mockDataService.getDataFileContent(userId, ctx.query.id);
    return { content };
  }

  // 保存数据文件
  @Post('/data')
  public async saveDataFile(@Ctx() ctx: Context) {
    const userId = ctx.userId;
    await this.mockDataService.saveDataFileContent(userId, ctx.query.id, ctx.request.body.content);
    return true;
  }
}
