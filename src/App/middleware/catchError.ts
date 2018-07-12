/**
 * 捕获 ProxyServer 异常中间件
 */
export function catchError() {
    return async function catchErrorMiddleware(ctx, next) {
        try {
            await next();
        } catch (err) {
            console.error(err);
        }
    }
}