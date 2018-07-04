const koa = require('koa');

class PrintURL {
    /* 
        manage方法返回一个koa应用，可用于插件的配置，插件可以有自己的接口和存储
        插件的默认前置路径为/plugins/{插件包名}
        该应用可以通过在插件管理中点击相应插件块就能访问
    */
    manage() {
        const app = new koa()
        app.use(ctx => {
            ctx.body = '这个中间件会在接收到请求时在控制台打印请求的URL'
        })
        return app
    }
    /*
        返回一个中间件函数，可以在这里自定义代理行为
    */
    proxy() {
        return async (ctx, next) => {
            console.log(ctx.req.url)
            await next()
        }
    }
}

module.exports = PrintURL