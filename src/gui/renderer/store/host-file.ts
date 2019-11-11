import { IHostFile } from '@core/types/host';
import { HOST_FILE_EVENTS } from '@gui/common/events';
import { ipcRenderer } from 'electron';
import { action, observable } from 'mobx';

export default class HostFileStore {
  @observable hostFiles: IHostFile[] = [];

  constructor() {
    ipcRenderer.on(HOST_FILE_EVENTS.list, (e, hostFiles) => {
      this.setHostFiles(hostFiles);
    });

    ipcRenderer.send(HOST_FILE_EVENTS.fetch);
  }

  @action
  public setHostFiles(hostFiles: IHostFile[]) {
    this.hostFiles = hostFiles;
  }
}
