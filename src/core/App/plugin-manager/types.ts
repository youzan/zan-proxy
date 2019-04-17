import koa from 'koa';

import { IProxyMiddlewareFn } from '../types/proxy';

export interface IPluginInfo {
  name: string;
  disabled?: boolean;
  version: string;
}

export interface IPluginModule extends IPluginInfo {
  manage: () => koa;
  proxy: () => IProxyMiddlewareFn;
}
