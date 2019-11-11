import ElectronStore from 'electron-store';
import { Service } from 'typedi';

/**
 * 配置存储获取单元
 *
 * @class Storage
 */
@Service()
export default class Storage extends ElectronStore<Partial<ZanProxyMac.IStorageStore>> {}
