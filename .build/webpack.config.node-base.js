'use strict';

process.env.BABEL_ENV = 'main';

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { isDev, rootResolve, runtimePathDefine, webpackAlias } = require('./utils');

/**
 * @type {import('webpack').Configuration}
 */
const nodeBaseConfig = {
  mode: process.env.NODE_ENV,
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
  optimization: {
    minimize: false,
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
  nodeBaseConfig.plugins.push(
    new webpack.DefinePlugin({
      ...runtimePathDefine,
    }),
    new FriendlyErrorsWebpackPlugin(),
  );
} else {
  /**
   * Adjust mainConfig for production settings
   */
  nodeBaseConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
  );
}

module.exports = nodeBaseConfig;
