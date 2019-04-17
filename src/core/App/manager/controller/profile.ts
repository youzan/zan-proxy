import { Inject, Service } from 'typedi';

import { ProfileService } from '../../services';

/**
 * Created by tsxuehu on 4/11/17.
 */

@Service()
export class ProfileController {
  @Inject() private profileService: ProfileService;

  public regist(router) {
    router.post('/profile/savefile', async ctx => {
      this.profileService.setProfile(ctx.request.body);
      ctx.body = {
        code: 0,
      };
    });

    router.post('/profile/setRuleState', async ctx => {
      await this.profileService.setEnableRule(!!ctx.query.rulestate);
      ctx.body = {
        code: 0,
      };
    });

    router.post('/profile/setHostState', async ctx => {
      await this.profileService.setEnableHost(!!ctx.query.hoststate);
      ctx.body = {
        code: 0,
      };
    });
  }
}
