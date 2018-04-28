import { Token } from 'typedi';
import { HasAsyncInit } from './hasAsyncInit';
import { Storage } from './Storage';

export interface Host {
  hostname: string;
  address: string;
}

export interface HostRecord {
  meta: HostRecordMeta;
  checked: boolean;
  name: string;
  description: string;
  content: Host[];
}

export interface HostRecordMeta {
  local: boolean;
}

export interface HostService extends HasAsyncInit {
  resolveHost(hostname: string): Promise<string>;
  createHostRecord(
    name: string,
    description: string,
    content?,
  ): Promise<HostRecord>;
  deleteHostRecord(name: string): Promise<HostRecord | undefined>;
  setUseHost(name: string): Promise<HostRecord | undefined>;
  getHostRecord(name: string): HostRecord | undefined;
  saveHostRecord(name: string, content: object): Promise<HostRecord>;
  getHostRecordList(): Promise<HostRecord[]>;
}

export const HostServiceToken = new Token<HostService>('service.host');
export const HostStorageToken = new Token<Storage>('storage.host');
