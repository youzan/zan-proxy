# Github Change Log

## zan-proxy@4.0.22 (2018-08-08)

**Fixed bug:**

- [windows下设置HOME环境变量后, postinstall和zan-proxy的HOME目录不一致](https://github.com/youzan/zan-proxy/issues/66)

## zan-proxy@4.0.21 (2018-08-07)

**Fixed bugs:**

- [修复windows下最近检查时间路径问题](https://github.com/youzan/zan-proxy/issues/61)
- [编辑规则时, 请求动作新增和删除功能不合理](https://github.com/youzan/zan-proxy/issues/60)


## zan-proxy@4.0.20 (2018-08-02)

**Implemented enhancements:**

- 支持转发规则优先级调整
- 支持复制cURL请求到粘贴板
- 检查更新后24小时内不再检查

## zan-proxy@4.0.19 (2018-07-24)

**Implemented enhancements:**

- 远程Host增加编辑提示
- 监控样式优化
- 启动时过滤不合法数据

**Fixed bugs:**

- [Mock数据过大无法保存](https://github.com/youzan/zan-proxy/issues/49)
- 工程路径包含非法字符仍可保存

## zan-proxy@4.0.15 ~ 4.0.18 (2018-07-13)

**Implemented enhancements:**

- [插件功能优化](https://github.com/youzan/zan-proxy/pull/43)
- host和转发规则过滤用户输入的收尾空格

**Fixed bugs:**

- [没有创建任何host文件的情况下, 没命中http转发规则的请求将会无响应](https://github.com/youzan/zan-proxy/issues/45)
- [更改Host失效](https://github.com/youzan/zan-proxy/issues/40)
- 代理请求不能被正常判断请求体结束

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