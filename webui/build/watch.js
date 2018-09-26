require('./check-versions')();

process.env.NODE_ENV = 'development';

const rm = require('rimraf');
const path = require('path');
const webpack = require('webpack');
const config = require('../config');
const webpackConfig = require('./webpack.watch.conf');
const chalk = require('chalk');

rm(
  path.join(
    config.build.assetsRoot,
    config.build.assetsSubDirectory,
  ),
  err => {
    if (err) throw err;
    const compiler = webpack(webpackConfig);
    compiler.watch(
      {},
      function(err, stats) {
        if (err) console.log(chalk.red(
          'error in watching',
          err,
        ));
        console.log(chalk.green(
          new Date(),
          'detected changing...',
        ));
      },
    );
  },
);
