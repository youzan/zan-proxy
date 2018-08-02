import { Inject, Service } from 'typedi';
import { ProfileService } from '../../services';

/**
 * Created by tsxuehu on 4/11/17.
 */

@Service()
export class ProfileController {
  @Inject()
  private profileService: ProfileService;

  public regist(router) {
    router.post('/profile/savefile', async ctx => {
      const userId = ctx.userId;
      await this.profileService.setProfile(userId, ctx.request.body);
      ctx.body = {
        code: 0,
      };
    });

    router.post('/profile/setRuleState', async ctx => {
      const userId = ctx.userId;
      await this.profileService.setEnableRule(userId, !!ctx.query.rulestate);
      ctx.body = {
        code: 0,
      };
    });

    router.post('/profile/setHostState', async ctx => {
      const userId = ctx.userId;
      await this.profileService.setEnableHost(userId, !!ctx.query.hoststate);
      ctx.body = {
        code: 0,
      };
    });
  }
}
