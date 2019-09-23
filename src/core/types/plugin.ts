import { IProxyMiddlewareFn } from '@core/types/proxy';
import Koa from 'koa';

export interface IPluginInfo {
  name: string;
  disabled?: boolean;
  version: string;
  registry: string;
}

export interface IPluginClass {
  manage: () => Koa;
  proxy: () => IProxyMiddlewareFn;
}

export type IPluginModule = IPluginInfo & IPluginClass;
