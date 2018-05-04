import fs from 'fs';
import mime from 'mime-types';
import URL from 'url';
import { MockDataService, ProfileService, RuleService } from '../services';

export const rule = ({
  ruleService,
  mockDataService,
  profileService,
}: {
  ruleService: RuleService;
  mockDataService: MockDataService;
  profileService: ProfileService;
}) => {
  return async (ctx, next) => {
    if (!profileService.enableRule(ctx.userID)) {
      await next();
      return;
    }
    const { userID } = ctx;
    const { req } = ctx;
    const { method, url } = req;
    const urlObj = URL.parse(url);
    const processRule = ruleService.getProcessRule(userID, method, urlObj);
    if (!processRule) {
      await next();
      return;
    }
    ctx.res.setHeader('zan-proxy-rule-match', processRule.match);
    if (urlObj.pathname && mime.lookup(urlObj.pathname)) {
      ctx.res.setHeader('Content-Type', mime.lookup(urlObj.pathname));
    }
    // 规则的响应头先缓存在这里
    const resHeaders = {};
    for (const action of processRule.actionList) {
      const { data } = action;
      switch (action.type) {
        case 'mockData':
          const { dataId } = data;
          const content = await mockDataService.getDataFileContent(
            userID,
            dataId,
          );
          const contentType = await mockDataService.getDataFileContentType(
            userID,
            dataId,
          );
          ctx.res.body = content;
          ctx.res.setHeader('Content-Type', contentType);
          break;
        case 'addRequestHeader':
          ctx.req.headers[data.headerKey] = data.headerValue;
          break;
        case 'addResponseHeader':
          resHeaders[data.headerKey] = data.headerValue;
          break;
        case 'empty':
          ctx.res.body = '';
          break;
        case 'redirect':
          const target = profileService.calcPath(
            userID,
            urlObj.href,
            processRule.match,
            data.target,
          );
          if (!target) {
            continue;
          }
          ctx.res.setHeader('zan-proxy-target', target);
          if (target.startsWith('http')) {
            ctx.req.url = target;
          } else {
            ctx.res.body = fs.createReadStream(target);
          }
          break;
        default:
          break;
      }
    }
    await next();
    Object.keys(resHeaders).forEach(headerKey => {
      ctx.res.setHeader(headerKey, resHeaders[headerKey]);
    });
  };
};
