import fs from 'fs-extra';
import http from 'http';
import mime from 'mime-types';
import { Inject, Service } from 'typedi';
import URL from 'url';

import { IRule, IRuleActionData } from '@core/types/rule';

import { MockDataService, ProfileService, RuleService } from '../../services';
import { IProxyContext, IProxyMiddleware, NextFunction } from '../../types/proxy';

/**
 * 转发规则处理中间件
 */
@Service()
export class RuleMiddleware implements IProxyMiddleware {
  @Inject() private ruleService: RuleService;
  @Inject() private mockDataService: MockDataService;
  @Inject() private profileService: ProfileService;

  /**
   * 处理 mock data 规则
   */
  private async processMockData(data: IRuleActionData, ctx: IProxyContext) {
    const { dataId } = data;
    const content = await this.mockDataService.getDataContent(dataId);
    const contentType = await this.mockDataService.getDataFileContentType(dataId);
    ctx.res.body = content;
    ctx.res.setHeader('Content-Type', contentType);
  }

  /**
   * 添加请求头
   */
  private async processAddRequestHeader(data: IRuleActionData, ctx: IProxyContext) {
    ctx.req.headers[data.headerKey] = data.headerValue;
  }

  /**
   * 添加响应头
   */
  private async processAddResponseHeader(data: IRuleActionData, resHeaders: http.OutgoingHttpHeaders) {
    resHeaders[data.headerKey] = data.headerValue;
  }

  /**
   * 返回空响应
   */
  private async processEmpty(ctx: IProxyContext) {
    ctx.res.body = '';
  }

  /**
   * 处理转发规则
   */
  private async processRedirect(
    urlObj: URL.UrlWithStringQuery,
    rule: IRule,
    data: IRuleActionData,
    ctx: IProxyContext,
  ) {
    const target = this.profileService.calcPath(urlObj.href as string, rule.match, data.target);
    if (!target) {
      return;
    }
    ctx.res.setHeader('zan-proxy-target', target);
    if (target.startsWith('http') || target.startsWith('ws')) {
      ctx.req.url = target;
    } else {
      const exists = await fs.pathExists(target);
      if (exists) {
        ctx.res.body = fs.createReadStream(target);
      } else {
        ctx.res.body = `target ${target} does not exist`;
        ctx.res.statusCode = 404;
      }
    }
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }

    // 未启用转发规则
    if (!this.profileService.enableRule) {
      return next();
    }

    const { req } = ctx;
    const { method, url } = req;
    const urlObj = URL.parse(url as string);
    const processRule = this.ruleService.getProcessRule(method as string, urlObj);
    // 没有转发规则
    if (!processRule) {
      return next();
    }

    ctx.res.setHeader('zan-proxy-rule-match', processRule.match);
    if (urlObj.pathname && mime.lookup(urlObj.pathname)) {
      // @ts-ignore
      ctx.res.setHeader('Content-Type', mime.lookup(urlObj.pathname));
    }

    // 规则的响应头先缓存在这里
    const resHeaders: Record<string, string> = {};
    for (const action of processRule.actionList) {
      const { data } = action;
      switch (action.type) {
        case 'mockData':
          await this.processMockData(data, ctx);
          break;
        case 'addRequestHeader':
          await this.processAddRequestHeader(data, ctx);
          break;
        case 'addResponseHeader':
          await this.processAddResponseHeader(data, resHeaders);
          break;
        case 'empty':
          await this.processEmpty(ctx);
          break;
        case 'redirect':
          await this.processRedirect(urlObj, processRule, data, ctx);
          break;
        default:
          break;
      }
    }
    await next();

    // 在响应中设置额外的响应头
    Object.keys(resHeaders).forEach(headerKey => {
      ctx.res.setHeader(headerKey, resHeaders[headerKey]);
    });
  }
}
