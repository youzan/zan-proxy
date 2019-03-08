'use strict';

process.env.BABEL_ENV = 'main';

const webpack = require('webpack');
const glob = require('fast-glob');
const nodeExternals = require('webpack-node-externals');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { rootResolve, runtimePathDefine, webpackAlias } = require('./utils');

const isDev = process.env.NODE_ENV !== 'production';

const mainConfig = {
  target: 'node',
  entry: glob.sync('test/**/*.spec.ts').reduce((map, item) => {
    map[item.replace(/^test\/(.*)\.ts/, (_, $1) => $1)] = rootResolve(item);
    return map;
  }, {}),
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
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      ...runtimePathDefine,
    }),
    new FriendlyErrorsWebpackPlugin(),
  ],
  resolve: {
    alias: webpackAlias,
    extensions: ['.js', '.ts', '.json', '.node'],
  },
};

module.exports = mainConfig;
