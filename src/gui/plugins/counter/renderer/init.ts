import logger from 'electron-log';
import { addOpenTimes } from './api';

export default function init() {
  return addOpenTimes().then(() => logger.log('counter init'));
}
