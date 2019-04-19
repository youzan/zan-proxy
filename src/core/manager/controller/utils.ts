import fs from 'fs-extra';
import { Context } from 'koa';
import path from 'path';
import { Controller, Ctx, Get } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { RuleFile } from '@core/types/rule';

import { AppInfoService, HostService, RuleService } from '../../services';

@Service()
@Controller('/utils')
export class UtilsController {
  @Inject() private appInfoService: AppInfoService;
  @Inject() private hostService: HostService;
  @Inject() private ruleService: RuleService;

  /**
   * 下载证书
   */
  @Get('/rootCA.crt')
  public rootCAFile(@Ctx() ctx: Context) {
    ctx.set('Content-disposition', 'attachment;filename=zproxy.crt');
    const filePath = path.join(this.appInfoService.proxyDataDir, 'certificate/root/zproxy.crt.pem');
    return fs.createReadStream(filePath, { encoding: 'utf-8' });
  }

  /**
   * 生成 pac 规则
   */
  @Get('/pac')
  public async pac(@Ctx() ctx: Context) {
    const ip = this.appInfoService.appInfo.LANIp;
    const port = this.appInfoService.appInfo.proxyPort;

    const matchScripts: string[] = [];

    const userIDs = Object.keys(this.ruleService.rules);
    for (const userID of userIDs) {
      const userRuleFilesMap = this.ruleService.rules[userID];
      const userRuleFiles: RuleFile[] = Object.keys(userRuleFilesMap).map(k => userRuleFilesMap[k]);
      for (const ruleFile of userRuleFiles) {
        for (const rule of ruleFile.content) {
          matchScripts.push(`if (url.indexOf("${rule.match}") > -1) { return zProxy; }`);
          matchScripts.push(
            `try {
              if ((new RegExp("${rule.match}")).test(url)) { return zProxy; }
            } catch(e){}`,
          );
        }
      }

      const hostFileList = this.hostService.getHostFileList(userID);
      for (const hostFile of hostFileList) {
        const hf = this.hostService.getHostFile(userID, hostFile.name);
        if (!hf) {
          continue;
        }
        const hostFileContent = hf.content;
        const hosts = Object.keys(hostFileContent);
        for (const host of hosts) {
          matchScripts.push(`if ( host == "${host}" ) { return zProxy; }`);
          if (host.startsWith('*')) {
            matchScripts.push(
              `if ( host.indexOf("${host.substr(1, host.length)}") > -1 ) { return zProxy; } `,
            );
          }
        }
      }
    }
    const pac = `\n\
                      var direct = 'DIRECT;';\n\
                      var zProxy = 'PROXY ${ip}:${port}';\n\
                      function FindProxyForURL(url, host) {\n\
                          ${matchScripts.join('\n')}
                          return direct;\n\
                     }`;
    ctx.set('Content-Type', 'application/x-javascript-config');
    return pac;
  }
}
