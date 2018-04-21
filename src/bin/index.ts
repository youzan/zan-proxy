#!/usr/bin/env node

import 'reflect-metadata';

import program from 'commander';
import ip from 'ip';
import open from 'open';
import start from './start';
import syncRule from './syncRule';
const packageInfo = require('../../package');

program
  .version(packageInfo.version)
  .description('start ZanProxy server')
  .option('-p, --proxy_port [value]', 'set the proxy port')
  .option('-u, --manager_port [value]', 'set the manager server port')
  .parse(process.argv);

async function run() {
  await syncRule();
  const managerPort = program.manager_port || 40001;
  const url = `http://${ip.address()}:${managerPort}`;
  await start(program.proxy_port, program.manager_port);
  open(url);
}

run();
