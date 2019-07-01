<template>
  <div class="intro-page">
    <h1>快速开始</h1>
    <h2>一、说明</h2>

    <p>
      由于
      <code>zanProxy</code>默认不修改系统代理设置，所以在 chrome 上使用代理功能时需要依赖第三方 chrome 插件。
    </p>
    <p><code>zanProxy</code>依赖 openssl 生成证书，使用 proxy 前请先安装 openssl (版本建议在 0.9.8 以上)。</p>

    <h2>二、chrome 插件安装</h2>

    <p>
      推荐安装 SwitchyOmega
      <a
        href="https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?hl=en-US"
        target="_blank"
        >点击安装代理插件</a
      >
    </p>

    <h4>插件使用说明</h4>

    <ol>
      <li>
        安装完插件后请设置插件代理地址为
        <code>127.0.0.1</code>，代理协议: http，端口为 <code>zanProxy</code>代理端口(默认8001)。
      </li>
      <li>
        如不清楚如何配置 SwitchyOmega，请参考
        <a href="https://youzan.github.io/zan-proxy/book/usage/chrome.html" target="_blank">chrome 代理设置指南</a>
      </li>
    </ol>

    <h2>三、证书安装</h2>

    <h4>1. 为什么需要安装证书</h4>

    <p>
      由于
      <code>zanProxy</code>需要转发 /mock https 的请求，所以需要本地安装 <code>ZanMock-proxy</code>https 证书。
    </p>

    <h4>2. 证书下载</h4>

    <ol>
      <li>
        mac 系统请
        <a :href="url">点击下载到本地安装</a>
      </li>
      <li>
        手机请扫码安装证书
        <img class="qrcode" :src="imgUrl" />
      </li>
      <li>
        证书信任请参考
        <a href="https://youzan.github.io/zan-proxy/book/quick-start/cert.html" target="_blank">如何信任证书</a>
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import qrcode from 'qrcode-js';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { getIp } from '../../api/utils';

@Component
export default class Intro extends Vue {
  ip = location.hostname;

  get url() {
    return `http://${this.ip}:${location.port || 80}/utils/rootCA.crt`;
  }

  get imgUrl() {
    return qrcode.toDataURL(this.url, 4);
  }

  created() {
    getIp().then(res => {
      this.ip = res.data;
    });
  }
}
</script>

<style lang="scss" scoped>
.intro-page {
  font-size: 14px;
  line-height: 1.8;
  background-color: #fff;

  .qrcode {
    display: block;
    margin-left: -15px;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: 400;
    margin: 20px 0 10px;
    color: rgba(51, 51, 51, 0.9);
  }

  h1 {
    margin: 0;
    font-size: 32px;
    font-family: Dosis, Source Sans Pro, Helvetica Neue, Arial, sans-serif;
  }

  h2 {
    color: #333;
    font-size: 24px;
    margin-top: 30px;

    &:first-of-type {
      margin-top: 10px;
    }
  }

  h4 {
    font-size: 18px;
  }

  code {
    margin: 2px;
    color: #455a64;
    padding: 2px 7px;
    font-size: 13px;
    overflow-x: auto;
    font-weight: 400;
    line-height: 22px;
    border-radius: 3px;
    margin-bottom: 25px;
    position: relative;
    word-break: break-all;
    white-space: pre-wrap;
    background-color: #f5f7fa;
    font-family: Source Code Pro, Monaco, Inconsolata, monospace;
  }

  ol {
    padding-left: 20px;
  }

  a {
    color: #3498db;
    text-decoration: none;
  }
}
</style>
