import os from 'os';

const platform = os.platform();

export const isWin = platform === 'win32';
export const isMac = platform === 'darwin';
