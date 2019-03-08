import { Service } from 'typedi';
// @ts-ignore
import * as ElectronStore from 'electron-store';

/**
 * 配置存储获取单元
 *
 * @class Storage
 */
@Service()
export default class Storage extends ElectronStore<Partial<ZanProxyMac.IStorageStore>> {}
