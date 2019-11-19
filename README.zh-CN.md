<p  align="left">
    <a href="https://github.com/youzan/"><img alt="logo" width="36" height="36" src="https://img.yzcdn.cn/public_files/2017/02/09/e84aa8cbbf7852688c86218c1f3bbf17.png" alt="youzan">
    </a>
</p>

<p  align="center">
<img src="https://img.yzcdn.cn/public_files/2018/07/16/78d4c3e8ac0cb627f57628b9e2c89346.png">
</p>

<p align="center" style="margin: 30px 0 35px;">本地代码调试线上页面，环境再也不是问题</p>

[![Build Status](https://travis-ci.org/youzan/zan-proxy.svg?branch=master)](https://travis-ci.org/youzan/zan-proxy)
[![downloads](https://img.shields.io/npm/dt/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)
[![npm version](https://img.shields.io/npm/v/zan-proxy.svg?style=flat)](https://www.npmjs.com/package/zan-proxy)
[![license](https://img.shields.io/npm/l/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)

`Zan Proxy` 是一个用Node.js编写的HTTP代理服务器，可用于修改请求地址和模拟响应数据。它同时也是一个自定义DNS解析和请求监控的工具。
该代理服务器有人性化的界面，简单易用。我们还为开发者提供了高级插件机制来自定义代理行为。

## 主要特性

* 简洁易用的图形化操作界面
* 支持HTTP，HTTPS和Websocket代理
* 支持自定义请求转发，可转发到本地文件
* 支持远程规则，可以在项目内共享规则
* 支持mock响应数据
* 支持自定义DNS解析
* 支持自定义插件

## 安装

从 [Github](https://github.com/youzan/zan-proxy/releases) 下载已经编译好的安装包。

### 从旧版本升级到 v5

Zan Proxy v5.0.0 做了一些不兼容的改动，升级时需要注意以下问题：

1. 为适配 macOS 10.15 和 ios 13，我们将 Zan Proxy 的证书进行了替换（从 1024 位升级到了 2048 位），在 Mac 上我们会自动帮您安装该证书，但是在其他设备（Windows、手机）上，需要您手动重新安装证书
2. 对部分配置文件进行了修改，这部分无需用户手动更新，v5.0.0 会自动进行文件的更新适配

## 界面

### GUI

<img src="https://img.yzcdn.cn/public_files/2019/03/01/b101dc19661fda0341aaff08239ac528.png" />

### Web

<img src="https://img.yzcdn.cn/public_files/2018/03/29/538c49fa295df7dc7184d75fc1c1ab99.png" />

## 使用文档

详细文档可以参考[这里](https://youzan.github.io/zan-proxy/book/).

## 从源码运行

1. 安装依赖

    ```shell
    yarn
    cd webui && yarn
    ```

2. 启动ui开发模式

    ```shell
    yarn dev:ui
    ```

3. 启动cli/gui开发模式

    ```shell
    yarn dev:cli  # cli development mode
    yarn dev:gui  # gui development mode
    ```

4. 构建

    ```shell
    yarn build:cli
    yarn build:gui
    ```


## 插件列表

* [zp-print-url](https://www.npmjs.com/package/zp-print-url) 打印请求url
* [zp-debug-tool](https://www.npmjs.com/package/zp-debug-tool) web调试工具

(欢迎pr补充)

## 相关链接

* [Vue UI](https://github.com/youzan/vant)
* [React UI](https://www.youzanyun.com/zanui/zent)
* [Weapp UI](https://github.com/youzan/zanui-weapp)

## 微信讨论群

欢迎大家加入 ZanProxy 交流群一起讨论，添加下方微信并注明『加入 ZanProxy 交流群』即可

<img src="https://img.yzcdn.cn/vant/wechat_20180606.png" width="220" height="292" >


## 开源协议

[MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)
