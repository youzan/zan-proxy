import { Context } from 'koa';
import { Ctx, Get, JsonController, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { MockDataService } from '../../services';

/**
 * 数据文件相关api
 */
@Service()
@JsonController('/mock')
export class MockDataController {
  @Inject() private mockDataService: MockDataService;

  // 获取mock数据列表
  @Get('/list')
  public async getDataList(@Ctx() ctx: Context) {
    const dataList = this.mockDataService.getMockList();
    return dataList;
  }

  // 保存数据列表
  @Post('/list')
  public async saveDataList(@Ctx() ctx: Context) {
    await this.mockDataService.saveMockList(ctx.request.body);
    return true;
  }

  // 读取数据文件
  @Get('/data')
  public async getDataFile(@Ctx() ctx: Context) {
    const content = await this.mockDataService.getDataContent(ctx.query.id);
    return { content };
  }

  // 保存数据文件
  @Post('/data')
  public async saveDataFile(@Ctx() ctx: Context) {
    await this.mockDataService.saveDataContent(ctx.query.id, ctx.request.body.content);
    return true;
  }
}
