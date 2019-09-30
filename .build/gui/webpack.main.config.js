'use strict';

const merge = require('webpack-merge');
const webpackNodeBaseConfig = require('../webpack.config.node-base');
const { rootResolve, scanGuiPlugins } = require('../utils');

const electronMainConfig = merge(webpackNodeBaseConfig, {
  target: 'electron-main',
  entry: {
    ...scanGuiPlugins('manager/index.ts'),
    main: [rootResolve('src/gui/main/index.ts'), rootResolve('src/gui/main/main.ts')],
  },
});

module.exports = electronMainConfig;
