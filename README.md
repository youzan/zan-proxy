<p  align="left">
    <a href="https://github.com/youzan/"><img alt="logo" width="36" height="36" src="https://img.yzcdn.cn/public_files/2017/02/09/e84aa8cbbf7852688c86218c1f3bbf17.png" alt="youzan">
    </a>
</p>

<p  align="center">
<img src="https://img.yzcdn.cn/public_files/2018/07/16/78d4c3e8ac0cb627f57628b9e2c89346.png">
</p>

<p align="center" style="margin: 30px 0 35px;">A proxy for your debug environment</p>

[访问中文版](./README.zh-CN.md)

[![Build Status](https://travis-ci.org/youzan/zan-proxy.svg?branch=master)](https://travis-ci.org/youzan/zan-proxy)
[![downloads](https://img.shields.io/npm/dt/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)
[![npm version](https://img.shields.io/npm/v/zan-proxy.svg?style=flat)](https://www.npmjs.com/package/zan-proxy)
[![license](https://img.shields.io/npm/l/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)

`Zan Proxy` is an HTTP proxy server written in Node.js, which can be used to modify requests and mock reponse data. It is also a tool for custom DNS resolving and requests monitoring.
The proxy server can be easily configured by a user-friendly interface. In addition, a mechanism is provided for developers to customize the behavior of the server.

## Features

* Clean and user-friendly interface
* Support HTTP, HTTPS and websocket
* Support remote redirect rules
* Modify the request target
* Mock the response data
* Custom plugins to modify default behaviour
* Custom DNS resolving
* GUI Configuration

## Installation

Download from [Github](https://github.com/youzan/zan-proxy/releases).

### Upgrade To v5

Zan Proxy v5.0.0 did some incompatible change，you should pay attention to something when upgrading：

1. To fit macOS 10.15 and ios 13, we replaced the Zan Proxy certificate(from 1024 bits to 2048 bits), we will automatically install the certificate for you on the Mac, but on other devices(like Windows、phone), you have to install the certificate manually.
2. Change some config file fields, but you need not update it manually, Zan Proxy will update these files automatically.

## Interface

### GUI

<img src="https://img.yzcdn.cn/public_files/2019/03/01/b101dc19661fda0341aaff08239ac528.png" />

### Web

<img src="https://img.yzcdn.cn/public_files/2018/03/29/538c49fa295df7dc7184d75fc1c1ab99.png" />

## Documentation

The detailed documentation can be refered [here](https://youzan.github.io/zan-proxy/book/).

## Running From Source Code

1. install dependencies

    ```shell
    yarn
    cd webui && yarn
    ```

2.  start webui development mode

    ```shell
    yarn dev:ui
    ```

3. start cli/gui development mode

    ```shell
    yarn dev:cli  # cli development mode
    yarn dev:gui  # gui development mode
    ```

4. build

    ```shell
    yarn build:cli
    yarn build:gui
    ```

## Plugins List

* [zp-print-url](https://www.npmjs.com/package/zp-print-url) print the urls
* [zp-debug-tool](https://www.npmjs.com/package/zp-debug-tool) web debug tool

(PRs are welcomed to append the list)

## Links

* [Vue UI](https://github.com/youzan/vant)
* [React UI](https://www.youzanyun.com/zanui/zent)
* [Weapp UI](https://github.com/youzan/zanui-weapp)

## Wechat Group

Scan the qrcode to join our wechat discussion group, please note that you want to join ZanProxy discussion group.

<img src="https://img.yzcdn.cn/vant/wechat_20180606.png" width="220" height="292" >

## LICENSE

[MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)
