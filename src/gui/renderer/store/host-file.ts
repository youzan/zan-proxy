import { ipcRenderer } from 'electron';
import { observable, action } from 'mobx';

import { HOST_FILE_EVENTS } from '@gui/common/events';

export default class HostFileStore {
  @observable hostFiles: ZanProxyMac.IHostFile[] = [];

  constructor() {
    ipcRenderer.on(HOST_FILE_EVENTS.list, (e, hostFiles) => {
      this.setHostFiles(hostFiles);
    });

    ipcRenderer.send(HOST_FILE_EVENTS.fetch);
  }

  @action
  public setHostFiles(hostFiles: ZanProxyMac.IHostFile[]) {
    this.hostFiles = hostFiles;
  }
}
