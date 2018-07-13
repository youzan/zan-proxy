<p  align="center">
    <img src="https://github.com/teneresa/zan-proxy/blob/master/New_Logo_files/PNG_files/Zan_Proxy_Logo_low_res.png">
    </a>
</p>
<h1 align="center"></h1>

<p align="center" style="margin: 30px 0 35px;">A proxy for your debug environment</p>

[访问中文版](./README.zh-CN.md)

[![Build Status](https://travis-ci.org/youzan/zan-proxy.svg?branch=master)](https://travis-ci.org/youzan/zan-proxy)
[![downloads](https://img.shields.io/npm/dt/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)
[![npm version](https://img.shields.io/npm/v/zan-proxy.svg?style=flat)](https://www.npmjs.com/package/zan-proxy)
[![license](https://img.shields.io/npm/l/zan-proxy.svg)](https://www.npmjs.com/package/zan-proxy)

`Zan Proxy` is an HTTP proxy server written in Node.js, which can be used to modify requests and mock reponse data. It is also a tool for custom DNS resolving and requests monitoring.
The proxy server can be easily configured by a user-friendly interface. In addition, a mechanism is provided for developers to customize the behavior of the server.

## Features

* Support HTTP, HTTPS and websocket
* Support remote redirect rules
* Modify the request target
* Mock the response data
* Custom plugins to modify default behaviour
* Custom DNS resolving
* GUI Configuration

## Installation

```shell
npm i -g zan-proxy
```

## Usage

```shell
zan-proxy
```

The website for management will be opened atomatically.

<img src="https://img.yzcdn.cn/public_files/2018/03/29/538c49fa295df7dc7184d75fc1c1ab99.png" />

## Documentation

The detailed documentation can be refered [here](https://youzan.github.io/zan-proxy/book/).

## Running From Source Code

1. install dependencies

    ```shell
    yarn
    ```

2. install ui dependencies

    ```shell
    cd webui/ && yarn
    ```

3. back to the project root directory

    ```shell
    cd ..
    ```

4. build

    ```shell
    yarn build
    ```

5. run

    ```shell
    node dist/bin/index.js
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

<img src="https://github.com/teneresa/zan-proxy/blob/master/New_Logo_files/new_wechat.png" width="220" height="292" >

## LICENSE

[MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)
