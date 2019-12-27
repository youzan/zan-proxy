# Github Change Log

## zan-proxy@5.1.0

**Feature:**

- 依赖升级，支持 windows 打包 [#128](https://github.com/youzan/zan-proxy/pull/128)
- 支持插件开发调试，为插件 class 构造函数注入 typedi 的 Container 参数 [#133](https://github.com/youzan/zan-proxy/pull/133)

**Bugfix:**

- 修复 content-type 头不存在时的报错 [#129](https://github.com/youzan/zan-proxy/pull/129)
- 修复保存配置时可能会出现左侧配置checkbox被多选的情况 [#132](https://github.com/youzan/zan-proxy/pull/132)
- 修复规则集列表页 toggle 点击失效的问题 [#134](https://github.com/youzan/zan-proxy/pull/134)

## zan-proxy@5.0.0（2019-11-11）

**Refactor:**

- 替换部分长期未更新的依赖包
- `vue` 及组件库升级，使用 `vuex` 替换 `vue-data-center`
- webui 部分添加了 typescript 支持
- 删除原来无用的配置文件，删除文件 root_ 前缀
- 将核心转发服务器和管理服务器移至 core 目录下，并进行重构，统一 middleware、controller、service 的风格

**Implemented enhancements:**

- 添加新版本配置文件的自动迁移脚本
- 插件支持动态开关，并添加升级按钮（升级后依旧需要重启）
- 添加证书缓存清理功能（GUI）
- 替换 2048 位证书以支持 ios 13 和 Mac OS 10.15

[PR](https://github.com/youzan/zan-proxy/pull/116)

## zan-proxy@4.1.0 (2019-03-08)

**Implemented enhancements:**

- 添加 mac 版 electron 客户端
- 调整目录结构，更新部分依赖
- 使用 @vue/cli 升级 webui 部分

## zan-proxy@4.0.23 ~ 4.0.27 (2019-01-20)

**Fixed bug:**
- 修复返回内容使用br算法压缩导致的解析出错（accept-encoding暂时改为'gzip, defalte'）
- 修复同步远程规则失败后无法再导入本地规则的问题
- 修复rule.meta 为undefined 时导致 zan-proxy 不可用的问题
- 修复请求监控-content-type非json或form-data的时候对request的body没有进行显示
- 修复使用说明页面，'chrome 代理设置指南' 链接错误的问题

**Implemented enhancements:**
- 将“工程路径”重命名为“转发变量”，满足更多的需求
- 转发规则编辑页增加返回列表按钮
- 调整目录结构，优化交互体验
- monitor 增加对在 response 中显示 set-cookie header 的支持

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
