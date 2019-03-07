'use strict';

process.env.BABEL_ENV = 'main';

const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

const { rootResolve, runtimePathDefine, webpackAlias, scanGuiPlugin } = require('../utils');

const isDev = process.env.NODE_ENV !== 'production';

const mainConfig = {
  mode: process.env.NODE_ENV,
  target: 'electron-main',
  entry: {
    ...scanGuiPlugin('manager/index.ts'),
    main: [rootResolve('src/gui/main/index.ts'), rootResolve('src/gui/main/main.ts')],
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {},
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  node: {
    __dirname: isDev,
    __filename: isDev,
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: rootResolve('dist'),
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin()],
  resolve: {
    alias: webpackAlias,
    extensions: ['.js', '.ts', '.json', '.node'],
  },
};

if (isDev) {
  /**
   * Adjust mainConfig for development settings
   */
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      ...runtimePathDefine,
    }),
  );
} else {
  /**
   * Adjust mainConfig for production settings
   */
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
  );
}

module.exports = mainConfig;
