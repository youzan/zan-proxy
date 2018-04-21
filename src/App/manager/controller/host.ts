import { Inject, Service } from 'typedi';
import { HostService } from './../../services';

@Service()
export class HostController {
  @Inject() private hostService: HostService;
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
    // /host/usefile?name=${name}
    router.get('/host/usefile', async ctx => {
      const userId = ctx.userId;
      await this.hostService.setUseHost(userId, ctx.query.name);
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
    router.post('/host/savefile', ctx => {
      const userId = ctx.userId;
      this.hostService.saveHostFile(userId, ctx.query.name, ctx.request.body);
      ctx.body = {
        code: 0,
      };
    });
  }
}
