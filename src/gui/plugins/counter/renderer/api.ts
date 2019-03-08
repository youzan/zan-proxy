import { ipcSend } from '@gui/renderer/utils/ipc';
import { DEMO_EVENTS } from '../common/constants';

export const addOpenTimes = () => ipcSend(DEMO_EVENTS.addOpenTimes);

export const fetchOpenTimes = () => ipcSend<number>(DEMO_EVENTS.fetchOpenTimes);
