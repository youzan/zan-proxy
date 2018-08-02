import { Inject, Service } from 'typedi';
import { ConfigureService } from '../../services';

@Service()
export class ConfigController {
  @Inject()
  private confService: ConfigureService;
  public regist(router) {
    router.post('/configure/savefile', async ctx => {
      const userId = ctx.userId;
      await this.confService.setConfigure(userId, ctx.request.body);
      ctx.body = {
        code: 0,
      };
    });
  }
}
