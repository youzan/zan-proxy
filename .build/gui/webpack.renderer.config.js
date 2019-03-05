'use strict';

process.env.BABEL_ENV = 'renderer';

const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const tsImportPluginFactory = require('ts-import-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const { rootResolve, runtimePathDefine, webpackAlias } = require('../utils');

/**
 * 扫描插件 renderer 入口
 */
function scanPluginsRenderer() {
  const pluginRoot = rootResolve('src/gui/plugins');
  const plugins = fs.readdirSync(pluginRoot);
  const entries = {};
  plugins.forEach(plugin => {
    const filePath = path.join(pluginRoot, plugin, 'renderer/index.ts');
    if (fs.existsSync(filePath)) {
      entries[plugin] = filePath;
    }
  });
  return entries;
}

const isDev = process.env.NODE_ENV !== 'production';

const styleLoader = [
  isDev
    ? {
        // dev style loader
        loader: 'style-loader',
      }
    : {
        // prod extract loader
        loader: MiniCssExtractPlugin.loader,
      },
];

const rendererConfig = {
  mode: process.env.NODE_ENV,
  target: 'electron-renderer',
  devtool: '#cheap-module-eval-source-map',
  entry: {
    vendor: ['react', 'react-dom', 'lodash', 'mobx', 'mobx-react', 'antd'],
    ...scanPluginsRenderer(), // 插件先加载，将组件设置到 window.__plugins
    renderer: rootResolve('src/gui/renderer/main.tsx'),
  },
  output: {
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].js',
    libraryTarget: 'commonjs2',
    path: rootResolve('dist'),
  },
  resolve: {
    alias: webpackAlias,
    extensions: ['.ts', '.tsx', '.js', 'jsx', '.json', '.css', 'scss', '.node'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              useBabel: true,
              babelCore: '@babel/core',
              getCustomTransformers: () => ({
                before: [tsImportPluginFactory([])],
              }),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      // use css-module
      {
        test: /\.m\.scss$/,
        use: [
          ...styleLoader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              camelCase: true,
              localIdentName: '[folder]__[local]__[hash:base64:5]',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /^((?!\.m).)*\.scss$/,
        use: [
          ...styleLoader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [...styleLoader, 'css-loader'],
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]',
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'media/[name]--[folder].[ext]',
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]',
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          test: 'vendor',
          name: 'vendor', // 使用 vendor 入口作为公共部分
          enforce: true,
        },
      },
    },
  },
  node: {
    __dirname: isDev,
    __filename: isDev,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: rootResolve('src/gui/index/.ejs'),
      nodeModules: isDev ? rootResolve('node_modules') : false,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ProgressBarPlugin(),
  ],
};

if (isDev) {
  /**
   * Adjust rendererConfig for development settings
   */
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      ...runtimePathDefine,
    }),
  );
} else {
  /**
   * Adjust rendererConfig for production settings
   */
  rendererConfig.devtool = '#source-map';

  rendererConfig.plugins.push(
    new CopyWebpackPlugin([
      {
        from: rootResolve('static'),
        to: rootResolve('dist/static'),
        ignore: ['.*'],
      },
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  );
}

if (process.env.ANALYZER) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  rendererConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = rendererConfig;
