import { Context } from 'koa';
import { Controller, Ctx, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { ProfileService } from '../../services';

@Service()
@Controller('/profile')
export class ProfileController {
  @Inject() private profileService: ProfileService;

  @Post('/savefile')
  public async saveFile(@Ctx() ctx: Context) {
    this.profileService.setProfile(ctx.request.body);
    return {
      code: 0,
    };
  }

  @Post('/setRuleState')
  public async setRuleState(@Ctx() ctx: Context) {
    await this.profileService.setEnableRule(!!ctx.query.rulestate);
    return {
      code: 0,
    };
  }

  @Post('/setHostState')
  public async setHostState(@Ctx() ctx: Context) {
    await this.profileService.setEnableHost(!!ctx.query.hoststate);
    return {
      code: 0,
    };
  }
}
