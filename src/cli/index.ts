import 'reflect-metadata';

import path from 'path';

import { migrateFromOld, resetDataFiles } from '@core/resetDataFiles';
import start from '@core/start';

if (process.env.NODE_ENV !== 'development') {
  global.__root = path.resolve(__dirname, '..');
  global.__site = path.resolve(__dirname, '../site');
  global.__static = path.resolve(__dirname, '../static');
  global.__resource = path.resolve(__dirname, '../resource');
}

process.on('unhandledRejection', (reason, p) => {
  if (process.env.DEBUG) {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
  }
});

process.on('uncaughtException', err => {
  if (process.env.DEBUG) {
    console.error(err);
  }
});

process.on('SIGINT', () => {
  process.exit();
});

async function run() {
  migrateFromOld();
  resetDataFiles();
  const proxyPort = parseInt(process.env.PROXY_PORT || '8001');
  const managerPort = parseInt(process.env.MANAGER_PORT || '40001');
  const managerHost = process.env.MANAGER_HOST || '0.0.0.0';
  await start(proxyPort, managerPort, managerHost);
}

run();
