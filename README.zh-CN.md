<p>
    <a href="https://github.com/youzan/"><img alt="logo" width="36" height="36" src="https://img.yzcdn.cn/public_files/2017/02/09/e84aa8cbbf7852688c86218c1f3bbf17.png" alt="youzan">
    </a>
</p>
<h1 align="center">
    Zan Proxy
</h1>

<p align="center" style="margin: 30px 0 35px;">本地代码调试线上页面，环境再也不是问题</p>

[![Build Status](https://travis-ci.org/youzan/zan-proxy.svg?branch=master)](https://travis-ci.org/youzan/zan-proxy)
[![downloads](https://img.shields.io/npm/dt/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)
[![npm version](https://img.shields.io/npm/v/zan-proxy.svg?style=flat)](https://www.npmjs.com/package/zan-proxy)
[![license](https://img.shields.io/npm/l/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)

`Zan Proxy` 是一个用Node.js编写的HTTP代理服务器，可用于修改请求地址和模拟响应数据。它同时也是一个自定义DNS解析和请求监控的工具。
该代理服务器有人性化的界面，简单易用。我们还为开发者提供了高级插件机制来自定义代理行为。

## 主要特性

* 支持HTTP，HTTPS和Websocket代理
* 支持自定义请求转发，可转发到本地文件
* 支持远程规则，可以在项目内共享规则
* 支持mock响应数据
* 支持自定义DNS解析
* 支持自定义插件，可定制代

## 安装

```shell
npm i -g zan-proxy
```

## 启动

```shell
zan-proxy
```

Zan Proxy的管理页面会自动打开。

<img src="https://img.yzcdn.cn/public_files/2018/03/29/538c49fa295df7dc7184d75fc1c1ab99.png" />

## 使用文档

详细文档可以参考[这里](https://youzan.github.io/zan-proxy/book/).

## 从源码运行

1. 安装依赖

    ```shell
    yarn
    ```

2. 安装ui依赖

    ```shell
    cd webui/ && yarn
    ```

3. 回到项目根目录

    ```shell
    cd ..
    ```

4. 构建

    ```shell
    yarn build
    ```

5. 运行

    ```shell
    node dist/bin/index.js
    ```

## 插件列表

* [zp-print-url](https://www.npmjs.com/package/zp-print-url) 打印请求url

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