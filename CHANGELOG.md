# Github Change Log

## zan-proxy@4.0.14 (2018-07-05)

**Implemented enhancements:**

- [支持Host多选](https://github.com/youzan/zan-proxy/issues/24)
- [支持转发规则集信息编辑](https://github.com/youzan/zan-proxy/pull/30)
- [使用fs.realpathSync判断dataFileRealPath是否包含mockDataDir](https://github.com/youzan/zan-proxy/pull/25)
- 优化构建命令
- 增加更新提示

**Fixed bugs:**

- [修复@types/node版本过高导致构建失败的问题](https://github.com/youzan/zan-proxy/issues/27)
- [删除特殊字符的规则时报错](https://github.com/youzan/zan-proxy/pull/28)
- 修复监控器请求数据展示异常
- 兼容没有action的老数据

## zan-proxy@4.0.11 ~ 4.0.13 (2018-06-12)

**Implemented enhancements:**

- 支持自定义websocket代理，可以自定义转发
- 调整中间件的顺序，把host解析延后至自定义插件之后

## zan-proxy@4.0.10 (2018-05-16)

**Implemented enhancements:**

- 增加导入远程Host文件功能
- 优化mock数据交互

**Fixed bugs:**

- 删除缓存数据导致启动失败的 [issue] (https://github.com/youzan/zan-proxy/issues/9)

## zan-proxy@4.0.6 ~ 4.0.9 (2018-05-07)

**Implemented enhancements:**

- 本地文件不存在将不会pending，会直接返回404，并给出本地路径
- 请求监控和转发规则将会忽略zanproxy的manager的请求
- 转发到本地会自动加上content-type响应头
- UI上若干优化

**Fixed bugs:**

- 修复请求监控中请求内容被遮挡的问题
- 自更新兼容npm的[issue]（https://github.com/npm/npm/issues/17444）

## zan-proxy@4.0.5 (2018-05-02)

**Implemented enhancements:**

- 支持规则集的复制
- 支持Host文件的导出与导入

**Fixed bugs:**

- 修复导出中文名字的规则集的bug
- 修复windows平台下导入规则集的[bug](https://github.com/youzan/zan-proxy/issues/2)