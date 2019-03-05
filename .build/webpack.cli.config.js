'use strict';

process.env.BABEL_ENV = 'main';

const path = require('path');
const { dependencies } = require('../package.json');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV !== 'production';

const mainConfig = {
  mode: process.env.NODE_ENV,
  entry: {
    main: path.join(__dirname, '../src/cli/index.ts'),
  },
  externals: [...Object.keys(dependencies || {})],
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
    path: path.join(__dirname, '../dist'),
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.json', '.node'],
  },
  target: 'node',
};

if (isDev) {
  /**
   * Adjust mainConfig for development settings
   */
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
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
