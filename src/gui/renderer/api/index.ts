import { ipcSend } from '../utils/ipc';
import { ZAN_PROXY_EVENTS, WORKSPACE_EVENTS } from '@gui/common/events';
import { toJS } from 'mobx';

export const showManager = (targetPath: string) => ipcSend(ZAN_PROXY_EVENTS.showManager, targetPath);

// workspace api
export const createWorkspace = () => ipcSend<ZanProxyMac.IWorkspace>(WORKSPACE_EVENTS.create);

export const activateWorkspace = (w: ZanProxyMac.IWorkspace) => ipcSend(WORKSPACE_EVENTS.activate, toJS(w));

export const deactivateWorkspace = (w: ZanProxyMac.IWorkspace) => ipcSend(WORKSPACE_EVENTS.deactivate, toJS(w));

export const removeWorkspace = (key: string) => ipcSend(WORKSPACE_EVENTS.remove, key);

export const saveWorkspace = (w: ZanProxyMac.IWorkspace) =>
  ipcSend<ZanProxyMac.IWorkspace>(WORKSPACE_EVENTS.save, toJS(w));

export const sortWorkspaces = (from: number, to: number) => ipcSend(WORKSPACE_EVENTS.sort, from, to);

export const exportWorkspace = (w: ZanProxyMac.IWorkspace) => ipcSend(WORKSPACE_EVENTS.export, toJS(w));

export const importWorkspace = () => ipcSend<ZanProxyMac.IWorkspace>(WORKSPACE_EVENTS.import);
