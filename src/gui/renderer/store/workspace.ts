import { WORKSPACE_EVENTS } from '@gui/common/events';
import { ipcRenderer } from 'electron';
import { cloneDeep } from 'lodash';
import { action, computed, observable } from 'mobx';
import uuid from 'uuid/v4';

export default class WorkspaceStore {
  @observable workspaces: ZanProxyMac.IWorkspace[] = [];
  // @ts-ignore
  @observable currentWorkspace: ZanProxyMac.IWorkspace = null;

  constructor() {
    ipcRenderer.on(WORKSPACE_EVENTS.list, (e, workspaces: ZanProxyMac.IWorkspace[]) => {
      this.setWorkspaces(workspaces);
    });

    // 第一次同步，确定 currentWorkspace
    ipcRenderer.once(WORKSPACE_EVENTS.list, () => {
      const current = this.workspaces.filter(w => w.checked)[0];
      if (current) {
        this.setCurrentWorkspace(current);
      }
    });

    ipcRenderer.send(WORKSPACE_EVENTS.fetch);
  }

  /**
   * 当前被激活的工作区
   */
  @computed
  public get activatedWorkspace() {
    return this.workspaces.find(ws => ws.checked);
  }

  @action
  public setWorkspaces(workspaces: ZanProxyMac.IWorkspace[]) {
    this.workspaces = workspaces;
  }

  /**
   * 设置当前工作区
   *
   * @param {IWorkspace} ws
   * @memberof WorkspacesStore
   */
  @action
  public setCurrentWorkspace(ws: ZanProxyMac.IWorkspace) {
    this.currentWorkspace = ws;
  }

  /**
   * 复制当前工作区
   * @returns
   */
  @action
  public copyWorkspace(ws: ZanProxyMac.IWorkspace) {
    const newWorkspace = cloneDeep(ws);
    newWorkspace.key = uuid();
    newWorkspace.checked = false;
    this.currentWorkspace = newWorkspace;
  }

  /**
   * 设置当前工作区属性
   *
   * @param {Partial<IWorkspace>} attrs
   * @memberof WorkspacesStore
   */
  @action
  public setCurrentWorkspaceAttrs(attrs: Partial<ZanProxyMac.IWorkspace>) {
    Object.assign(this.currentWorkspace, attrs);
  }
}
