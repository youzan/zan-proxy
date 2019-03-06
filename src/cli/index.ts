import 'reflect-metadata';
import promiseFinally from 'promise.prototype.finally';
import program from 'commander';
import path from 'path';
import ip from 'ip';
import open from 'open';
import selfUpdate from './selfUpdate';
import start from '@core/start';
import syncHost from '@core/syncHost';
import syncRule from '@core/syncRule';
import resetDataFiles from '@core/resetDataFiles';

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
  .option('--no-update', 'do not check if update available')
  .option('--no-sync', 'do not sync remote rules')
  .parse(process.argv);

async function run() {
  resetDataFiles();
  if (program.update) {
    await selfUpdate();
  }
  if (program.sync) {
    await syncRule();
    await syncHost();
  }
  const managerPort = program.manager_port || 40001;
  const url = `http://${ip.address()}:${managerPort}`;
  await start(program.proxy_port, program.manager_port);
  open(url);
}

run();
