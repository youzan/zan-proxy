import URL from 'url'
import fs from 'fs'
import {
    Middleware,
    RuleService,
    MockService,
    ProfileConfigService
} from '../service'

export const ruleMiddleware = ({
    ruleService,
    mockService,
    profileConfigService
}: {
    ruleService: RuleService,
    mockService: MockService,
    profileConfigService: ProfileConfigService
}): Middleware => next => async ctx => {
    const isRuleEnabled = await profileConfigService.isRuleEnabled()
    if (!isRuleEnabled) {
        return next(ctx)
    }
    const {
        req
    } = ctx
    const {
        method,
        url
    } = req
    const urlObj = URL.parse(url || '')
    const rule = await ruleService.getProcessRule(method || 'GET', urlObj.href || '')
    if (!rule || !rule.actionList) {
        return next(ctx)
    }
    for (let i = 0; i < rule.actionList.length; i++) {
        const action = rule.actionList[i]
        const {
            type,
            data
        } = action
        if (!data) {
            continue
        }
        switch (type) {
            case 'mockData':
                ctx.preventResolve = true
                if (!data.dataId) {
                    continue
                }
                const mockData = await mockService.getMockDataByID(data.dataId)
                if (!mockData) {
                    continue
                }
                ctx.res.setHeader('Content-type', `${mockData.type};charset=utf-8`)
                ctx.res.body = mockData.content
                break
            case 'addRequestHeader':
                if (!data.headerKey) {
                    continue
                }
                ctx.req.headers[data.headerKey] = data.headerValue
                break;
            case 'addResponseHeader':
                if (!data.headerKey) {
                    continue
                }
                ctx.res.setHeader(data.headerKey, data.headerValue || '')
                break
            case 'redirect':
                let target = await profileConfigService.calcPath(urlObj.href, rule.match, data.target);
                if (!target) {
                    continue;
                }
                if (target.startsWith('http')) {
                    ctx.req.url = target;
                } else {
                    ctx.preventResolve = true
                    ctx.res.body = fs.createReadStream(target)
                }
                break
            default:
                break
        }
    }
    return next(ctx)
}