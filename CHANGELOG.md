# Github Change Log

## zan-proxy@4.0.5 (2018-05-02)

**Implemented enhancements:**

- 支持规则集的复制
- 支持Host文件的导出与导入

**Fixed bugs:**

- 修复导出中文名字的规则集的bug
- 修复windows平台下导入规则集的[bug](https://github.com/youzan/zan-proxy/issues/2)

## zan-proxy@4.0.6 ~ 4.0.9 (2018-05-07)

**Implemented enhancements:**

- 本地文件不存在将不会pending，会直接返回404，并给出本地路径
- 请求监控和转发规则将会忽略zanproxy的manager的请求
- 转发到本地会自动加上content-type响应头
- UI上若干优化

**Fixed bugs:**

- 修复请求监控中请求内容被遮挡的问题
- 自更新兼容npm的[issue]（https://github.com/npm/npm/issues/17444）