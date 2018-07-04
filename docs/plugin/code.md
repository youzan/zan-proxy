# 编写插件

ZanProxy插件是是一个**npm包**，这个npm包需要导出一个类，这个类要实现两个方法：`proxy`和`manage`，**除此之外没有任何特殊要求**。 `proxy`方法用于请求的处理，`manage`方法用于插件的配置。

可以参考的例子：[点击这里](https://github.com/youzan/zan-proxy/tree/master/plugin-examples)。

**注意**

写好ZanProxy插件包后需要发包，可以发布到私有仓库，添加时可以指定私有仓库的地址。

## proxy方法

proxy方法需要返回一个ZanProxy`中间件`，该`中间件`会被加载到代理服务器中。

### 中间件

ZanProxy中间件是一个处理请求的函数，形如`async (ctx, next) => {...}`。其中`ctx`是请求的上下文，默认有两个属性`req`和`res`。

`req`是一个`http.IncomingMessage`实例，代表着请求。如果`req.body`被赋值，则请求体的body会被替代。目前`req.body`只支持字符串类型。

`res`是一个`http.ServerResponse`实例，代表着响应。如果`res.body`被赋值，则响应体的body会被替代，*且请求不会被转发*。`res.body`

#### 添加Access-Control-Allow-Origin响应头的中间件的例子

```javascript
    async (ctx, next) => {
        ctx.res.setHeader('Access-Control-Allow-Origin', '*');
        await next()
    }
```

## manage方法

manage方法需要返回一个Koa的App，该app会被挂载到ZanProxy管理服务器的`/plugins/{插件名}`路径，用于插件的可视化数据管理。该app可以有自己的http接口和静态资源。

### 管理Access-Control-Allow-Origin响应头数据的manage例子

```javascript
    manage() {
        const router = new Router();
        const root = path.join(__dirname, '../ui/site/') // 静态页面的路径
        router.post('/save', async ctx => {
            const cors = ctx.request.body.cors;
            this.cors = cors;
            ctx.body = {
                status: 200,
                msg: 'OK'
            }
        })
        router.get('/cors', async ctx => {
            ctx.body = {
                status: 200,
                msg: 'OK',
                data: {
                    cors: this.cors
                }
            }
        })
        const app = new Koa()
        app
            .use(bodyparser())
            .use(router.routes())
            .use(router.allowedMethods())
            .use(KoaStatic(root))
        return app;
    }
```

## 完整的添加Access-Control-Allow-Origin响应头的插件的例子

```javascript
    const Router = require('koa-router');
    const KoaStatic = require('koa-static');
    const path = require('path');
    const bodyparser = require('koa-bodyparser');
    const Koa = require('koa');

    module.exports = class CorsPlugin {
        constructor() {
            this.cors = '*'
        }
        manage() {
            const router = new Router();
            const root = path.join(__dirname, '../ui/site/') // 静态页面的路径
            router.post('/save', async ctx => {
                const cors = ctx.request.body.cors;
                this.cors = cors;
                ctx.body = {
                    status: 200,
                    msg: 'OK'
                }
            })
            router.get('/cors', async ctx => {
                ctx.body = {
                    status: 200,
                    msg: 'OK',
                    data: {
                        cors: this.cors
                    }
                }
            })
            const app = new Koa()
            app
                .use(bodyparser())
                .use(router.routes())
                .use(router.allowedMethods())
                .use(KoaStatic(root))
            return app;
        }
        proxy() {
            return async (ctx, next) => {
                ctx.res.setHeader('Access-Control-Allow-Origin', this.cors || '*');
                await next()
            }
        }
    }
```

<img src="https://img.yzcdn.cn/public_files/2018/04/20/02a9d0f12242ef24cd81c30e504ed1fe.png">