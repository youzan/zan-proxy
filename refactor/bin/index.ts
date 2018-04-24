#!/usr/bin/env node
const program = require('commander');
const packageInfo = require("../../package.json");
const ip = require('ip');
const open = require('open');

import start from './start';
import Manager from '@youzan/proxy-plugin-manager';

const manager = new Manager()

program
    .version(packageInfo.version);


// program
//     .command('list')
//     .description('list all custom middlewares')
//     .action(() => {
//         const middlewares = list()
//         middlewares.forEach(n => console.log(n))
//         if (!middlewares.length) {
//             console.log('no custom middlewares')
//         }
//     });

program
    .command('add [pkgName]')
    .description('install a package as a plugin')
    .option("-r, --npm_registry [registry]", "Which setup mode to use")
    .action(function(pkgName, options){
      const registry = options.npm_registry || null;
      if (!pkgName) {
          console.error('package name is required');
          return;
      }
      let npmConfig = {};
      if (registry) {
          npmConfig = { registry };
      }
      manager.add(pkgName, npmConfig)
    });

program
    .command('remove [name]')
    .description('remove a custom middleware')
    .action(name => {
        manager.remove(name)
    });

program
    .command('start')
    .description('start ZanProxy server')
    .option('-p, --proxy_port [value]', 'set the proxy port')
    .option('-u, --manager_port [value]', 'set the manager server port')
    .action(options => {
        const managerPort = options.manager_port || 40001;
        const url = `http://${ip.address()}:${managerPort}`
        open(url)
        start(options.proxy_port, options.manager_port);
    })

program.parse(process.argv)

if (program.args.length === 0) {
    start()
    open(`http://${ip.address()}:40001`)
}