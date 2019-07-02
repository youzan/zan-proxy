import { Context } from 'koa';
import { Controller, Ctx, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { ProfileService } from '../../services';

@Service()
@Controller('/profile')
export class ProfileController {
  @Inject() private profileService: ProfileService;

  @Post('/project-path')
  public async saveProjectPath(@Ctx() ctx: Context) {
    await this.profileService.setProjectPath(ctx.request.body);
    return true;
  }

  @Post('/rule/enable')
  public async setRuleState(@Ctx() ctx: Context) {
    await this.profileService.setEnableRule(ctx.request.body.enable);
    return true;
  }

  @Post('/host/enable')
  public async setHostState(@Ctx() ctx: Context) {
    await this.profileService.setEnableHost(ctx.request.body.enable);
    return true;
  }
}
