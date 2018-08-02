import Router from 'koa-router';
import { Inject, Service } from 'typedi';
import { ProfileService, RuleService, ErrNameExists } from '../../services';
/**
 * Created by tsxuehu on 4/11/17.
 */
@Service()
export class RuleController {
  @Inject()
  private ruleService: RuleService;
  @Inject()
  private profileService: ProfileService;

  public regist(router) {
    // 创建规则
    // {
    //    name:name,
    //    description:description
    // }
    const ruleRouter = new Router({
      prefix: '/rule',
    });
    ruleRouter.post('/create', async ctx => {
      const userId = ctx.userId;
      try {
        const result = await this.ruleService.createRuleFile(
          userId,
          ctx.request.body.name,
          ctx.request.body.description,
        );
        ctx.body = {
          code: 0,
          msg: result,
        };
        return;
      } catch (error) {
        const msg =
          error === ErrNameExists
            ? '文件已存在'
            : `未知错误: ${error.toString()}`;
        ctx.body = {
          code: 1,
          msg,
        };
      }
    });
    // 获取规则文件列表
    // /rule/filelist
    ruleRouter.get('/filelist', async ctx => {
      const userId = ctx.userId;
      const ruleFileList = await this.ruleService.getRuleFileList(userId);
      ctx.body = {
        code: 0,
        list: ruleFileList,
      };
    });
    // 删除规则文件
    // /rule/deletefile?name=${name}
    ruleRouter.get('/deletefile', async ctx => {
      const userId = ctx.userId;
      await this.ruleService.deleteRuleFile(userId, ctx.query.name);
      ctx.body = {
        code: 0,
      };
    });
    // 设置文件勾选状态
    // /rule/setfilecheckstatus?name=${name}&checked=${checked?1:0}
    ruleRouter.get('/setfilecheckstatus', ctx => {
      const userId = ctx.userId;
      this.ruleService.setRuleFileCheckStatus(
        userId,
        ctx.query.name,
        parseInt(ctx.query.checked, 10) === 1 ? true : false,
      );
      ctx.body = {
        code: 0,
      };
    });
    // 设置文件勾选状态
    // /rule/setfiledisablesync?name=${name}&diable=${disable?1:0}
    ruleRouter.get('/setfiledisablesync', ctx => {
      const userId = ctx.userId;
      this.ruleService.setRuleFileDisableSync(
        userId,
        ctx.query.name,
        parseInt(ctx.query.disable, 10) === 1 ? true : false,
      );
      ctx.body = {
        code: 0,
      };
    });
    // 获取规则文件
    // /rule/getfile?name=${name}
    ruleRouter.get('/getfile', async ctx => {
      const userId = ctx.userId;
      const content = await this.ruleService.getRuleFile(
        userId,
        ctx.query.name,
      );
      ctx.body = {
        code: 0,
        data: content,
      };
    });
    // 保存规则文件
    // /rule/savefile?name=${name} ,content
    ruleRouter.post('/savefile', async ctx => {
      const userId = ctx.userId;
      await this.ruleService.saveRuleFile(userId, ctx.request.body);
      ctx.body = {
        code: 0,
      };
    });

    // 重命名规则文件
    // /rule/changefilename/:origin, body -> { name, description }
    ruleRouter.post('/updatefileinfo/:origin', async ctx => {
      const { userId, params, request } = ctx;
      const { origin } = params;
      const { name, description } = request.body;
      try {
        await this.ruleService.updateFileInfo(userId, origin, {
          description,
          name,
        });
        ctx.body = {
          code: 0,
        };
      } catch (e) {
        const msg =
          e === ErrNameExists ? '有重复名字' : `未知错误: ${e.toString()}`;
        ctx.body = {
          code: 1,
          msg,
        };
      }
    });

    // 导出规则文件
    // /rule/download?name=${name}
    ruleRouter.get('/download', async ctx => {
      const userId = ctx.userId;
      const name = ctx.query.name;
      const content = await this.ruleService.getRuleFile(userId, name);
      ctx.set(
        'Content-disposition',
        `attachment;filename=${encodeURI(name)}.json`,
      );
      ctx.body = content;
    });
    // 测试规则
    // /rule/test
    ruleRouter.post('/test', async ctx => {
      /*
             url: '',// 请求url
             match: '',// url匹配规则
             targetTpl: '',// 路径模板， 会用urlReg的匹配结果来替换targetTpl $1 $2
             matchRlt: '',// url匹配结果
             targetRlt: ''// 路径匹配结果
             */
      const userId = ctx.userId;
      const match = ctx.request.body.match;
      const url = ctx.request.body.url;
      let matchRlt = '不匹配';

      if (match && (url.indexOf(match) >= 0 || new RegExp(match).test(url))) {
        matchRlt = 'url匹配通过';
      }

      const targetTpl = ctx.request.body.targetTpl;
      const targetRlt = await this.profileService.calcPath(
        userId,
        url,
        match,
        targetTpl,
      );

      // 测试规则
      ctx.body = {
        code: 0,
        data: {
          matchRlt,
          targetRlt,
        },
      };
    });

    ruleRouter.get('/import', async ctx => {
      const { userId, query } = ctx;
      const ruleFileUrl = query.url;
      try {
        const ruleFile = await this.ruleService.importRemoteRuleFile(
          userId,
          ruleFileUrl,
        );
        ctx.body = {
          code: 0,
          data: ruleFile,
        };
      } catch (e) {
        ctx.body = {
          code: 1,
          msg: e,
        };
      }
    });

    ruleRouter.get('/copy', async ctx => {
      const userId = ctx.userId;
      const name = ctx.query.name;
      const copied = await this.ruleService.copyRuleFile(userId, name);
      ctx.body = {
        code: 0,
        data: copied,
      };
    });

    router.use(ruleRouter.routes(), ruleRouter.allowedMethods());
  }
}
