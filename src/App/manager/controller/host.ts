import { Inject, Service } from 'typedi';
import { HostService } from './../../services';

@Service()
export class HostController {
  @Inject()
  private hostService: HostService;
  public regist(router) {
    // {
    //    name:name,
    //    description:description
    // }
    router.post('/host/create', async ctx => {
      const userId = ctx.userId;

      const result = await this.hostService.createHostFile(
        userId,
        ctx.request.body.name,
        ctx.request.body.description,
      );
      ctx.body = {
        code: result ? 0 : 1,
        msg: result ? '' : '文件已存在',
      };
    });
    router.get('/host/filelist', async ctx => {
      const userId = ctx.userId;
      const hostList = await this.hostService.getHostFileList(userId);
      ctx.body = {
        code: 0,
        list: hostList,
      };
    });
    // /host/deletefile?name=${name}
    router.get('/host/deletefile', ctx => {
      const userId = ctx.userId;
      this.hostService.deleteHostFile(userId, ctx.query.name);
      ctx.body = {
        code: 0,
      };
    });
    // /host/togglefile?name=${name}
    router.get('/host/togglefile', async ctx => {
      const userId = ctx.userId;
      const { name } = ctx.query;
      await this.hostService.toggleUseHost(userId, name);
      ctx.body = {
        code: 0,
      };
    });
    // /host/getfile?name=${name}
    router.get('/host/getfile', async ctx => {
      const userId = ctx.userId;
      const hostFile = await this.hostService.getHostFile(
        userId,
        ctx.query.name,
      );
      ctx.body = {
        code: 0,
        data: hostFile,
      };
    });
    // /host/savefile?name=${name} ,content
    router.post('/host/savefile', async ctx => {
      const userId = ctx.userId;
      await this.hostService.saveHostFile(
        userId,
        ctx.query.name,
        ctx.request.body,
      );
      ctx.body = {
        code: 0,
      };
    });

    router.get('/host/download', async ctx => {
      const userId = ctx.userId;
      const name = ctx.query.name;
      const content = await this.hostService.getHostFile(userId, name);
      ctx.set(
        'Content-disposition',
        `attachment;filename=${encodeURI(name)}.json`,
      );
      ctx.body = content;
    });

    router.get('/host/import', async ctx => {
      const { userId, query } = ctx;
      const hostFileUrl = query.url;
      try {
        const hostFile = await this.hostService.importRemoteHostFile(
          userId,
          hostFileUrl,
        );
        ctx.body = {
          code: 0,
          data: hostFile,
        };
      } catch (e) {
        ctx.body = {
          code: 1,
          msg: e,
        };
      }
    });
  }
}
