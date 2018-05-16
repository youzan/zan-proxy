#!/usr/bin/env node

import 'reflect-metadata';

import program from 'commander';
import ip from 'ip';
import open from 'open';
import selfUpdate from './selfUpdate';
import start from './start';
import syncHost from './syncHost';
import syncRule from './syncRule';

const packageInfo = require('../../package');

program
  .version(packageInfo.version)
  .description('start ZanProxy server')
  .option('-p, --proxy_port [value]', 'set the proxy port')
  .option('-m, --manager_port [value]', 'set the manager server port')
  .option('--no-update', 'do not check if update available')
  .option('--no-sync', 'do not sync remote rules')
  .parse(process.argv);

async function run() {
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
