import URL from 'url';
import fs from 'fs';
export default ({ruleService, mockDataService, profileService}) => {
    return async(ctx, next) => {
        const { userID } = ctx;
        const { req } = ctx;
        const { method, url } = req;
        const urlObj = URL.parse(url);
        const rule = ruleService.getProcessRuleList(userID, method, urlObj);
        if (!rule) {
            await next();
            return;
        }
        ctx.res.setHeader('zan-proxy-rule-watch', rule.match);
        for (let i = 0; i < rule.actionList.length; i++) {
            const action = rule.actionList[i];
            const { data } = action;
            switch (action.type) {
                case 'mockData':
                    let { dataId } = data;
                    let content = await mockDataService.getDataFileContent(userID, dataId);
                    let contentType = await mockDataService.getDataFileContentType(userID, dataId);
                    ctx.res.body = content;
                    ctx.preventResolve = true
                    ctx.res.setHeader('Content-Type', contentType)
                    break;
                case 'addRequestHeader':
                    ctx.req.headers[data.headerKey] = data.headerValue;
                    break;
                case 'addResponseHeader':
                    ctx.res.setHeader(data.headerKey, data.headerValue);
                    break;
                case 'redirect':
                    let target = profileService.calcPath(userID, urlObj.href, rule.match, data.target);
                    if (!target) {
                        continue;
                    }
                    ctx.res.setHeader('zan-proxy-target', target);
                    if (target.startsWith('http')) {
                        ctx.req.url = target;
                    } else {
                        ctx.preventResolve = true 
                        ctx.res.body = fs.readFileSync(target, { encoding: 'utf-8' });
                    }
                    break;
                default:
                    break;
            }
        }
        await next();
    }
}
