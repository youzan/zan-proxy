'use strict';

const merge = require('webpack-merge');
const webpackNodeBaseConfig = require('../webpack.config.node-base');
const { rootResolve } = require('../utils');

const mainConfig = merge(webpackNodeBaseConfig, {
  target: 'node',
  entry: {
    main: rootResolve('src/cli/index.ts'),
  },
});

module.exports = mainConfig;
