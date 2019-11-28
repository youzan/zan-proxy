import { Context } from 'koa';
import { Ctx, JsonController, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { ProfileService } from '../../services';

@Service()
@JsonController('/profile')
export class ProfileController {
  @Inject() private profileService: ProfileService;

  @Post('/project-path')
  public async saveProjectPath(@Ctx() ctx: Context) {
    await this.profileService.setProjectPath(ctx.request.body);
    return true;
  }

  @Post('/rule/toggle')
  public async setRuleState(@Ctx() ctx: Context) {
    await this.profileService.setEnableRule(ctx.request.body.enable);
    return true;
  }

  @Post('/host/toggle')
  public async setHostState(@Ctx() ctx: Context) {
    await this.profileService.setEnableHost(ctx.request.body.enable);
    return true;
  }

  @Post('/custom-proxy')
  public async saveCustomProxy(@Ctx() ctx: Context) {
    await this.profileService.setCustomProxsy(ctx.request.body.customProxy);
    return true;
  }
}
