<template>
  <div class="intro-page">
    <h1>快速开始</h1>
    <h2>一、说明</h2>

    <p>由于 ZanProxy 默认不修改系统代理设置，所以在 chrome 上使用代理功能时需要依赖第三方 chrome 插件。</p>
    <p>ZanProxy 依赖 openssl 生成证书，使用 proxy 前请先安装 openssl (版本建议在 0.9.8 以上)。</p>

    <h2>二、chrome 插件安装</h2>

    <p>
      推荐安装
      <a
        href="https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif"
        target="_blank"
      >
        SwitchyOmega
      </a>
    </p>

    <h4>插件使用说明</h4>
    <ol>
      <li>
        安装完插件后请设置插件代理地址为 127.0.0.1，代理协议: http，端口为 ZanProxy 代理端口(默认8001)。
      </li>
      <li>
        如不清楚如何配置 SwitchyOmega，请参考
        <a href="https://youzan.github.io/zan-proxy/book/usage/chrome.html" target="_blank">chrome 代理设置指南</a>
      </li>
    </ol>

    <h2>三、下载和安装证书</h2>

    <ol>
      <li><a :href="url">下载证书文件</a>并在本地安装（Mac客户端不需要手动安装）</li>
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

  .qrcode {
    display: block;
    margin-left: -16px;
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

  ol {
    padding-left: 16px;
  }

  a {
    color: #409eff;
    text-decoration: none;
  }
}
</style>
