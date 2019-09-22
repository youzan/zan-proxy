import 'reflect-metadata';
import promiseFinally from 'promise.prototype.finally';
import program from 'commander';
import path from 'path';
import open from 'open';
import start from '@core/start';
import syncHost from '@core/syncHost';
import syncRule from '@core/syncRule';
import resetDataFiles, { migrateFromOld } from '@core/resetDataFiles';

import packageInfo from '../../package.json';
promiseFinally.shim();

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

program
  .version(packageInfo.version)
  .description('start ZanProxy server')
  .option('-p, --proxy_port [value]', 'set the proxy port')
  .option('-m, --manager_port [value]', 'set the manager server port')
  .option('--manager_host [value]', 'set the manager server host')
  .option('--no-sync', 'do not sync remote rules')
  .parse(process.argv);

async function run() {
  migrateFromOld();
  resetDataFiles();
  if (program.sync) {
    await syncRule();
    await syncHost();
  }
  const proxyPort = program.proxy_port || 8001;
  const managerPort = program.manager_port || 40001;
  const managerHost = program.manager_host || '0.0.0.0';
  await start(proxyPort, managerPort, managerHost);
  open(`http://localhost:${managerPort}`);
}

run();
