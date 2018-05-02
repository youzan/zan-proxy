# Zan Proxy

```Zan Proxy```是一个用Node.js编写的HTTP代理服务器，可用于修改请求地址和模拟响应数据。它同时也是一个自定义DNS解析和请求监控的工具。
该代理服务器有人性化的界面，简单易用。我们还为开发者提供了高级插件机制来自定义代理行为。

## 主要特性

* 支持HTTP，HTTPS和Websocket代理
* 支持自定义请求转发，可转发到本地文件
* 支持远程规则，可以在项目内共享规则
* 支持mock响应数据
* 支持自定义DNS解析
* 支持自定义插件，可定制代理行为
* 图形化配置，上手容易

<img src="https://img.yzcdn.cn/public_files/2018/04/17/7dbc1ee4b763d7f8f7b21310200ce238.png" />

## 帮助手册

* [快速开始](quick-start/README.md)
    * [前置条件](quick-start/pre-install.md)
    * [安装](quick-start/install.md)
    * [启动](quick-start/launch.md)
    * [证书安装](quick-start/cert.md)
* [代理配置](configure/README.md)
    * [Host管理](configure/host.md)
    * [转发规则](configure/rule.md)
    * [工程路径](configure/project.md)
    * [mock数据](configure/mock.md)
* [使用代理](usage/README.md)
    * [chrome代理配置](usage/chrome.md)
    * [手机代理设置](usage/mobile.md)
    * [规则启用/禁用](usage/enable.md)
    * [请求监控](usage/monitor.md)
* [自定义插件](plugin/README.md)
    * [编写插件](plugin/code.md)
    * [使用插件](plugin/usage.md)