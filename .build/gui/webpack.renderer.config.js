'use strict';

process.env.BABEL_ENV = 'renderer';

const webpack = require('webpack');
const tsImportPluginFactory = require('ts-import-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const { isDev, rootResolve, runtimePathDefine, webpackAlias, scanGuiPlugins } = require('../utils');

const styleLoader = {
  loader: MiniCssExtractPlugin.loader,
  options: {
    // only enable hot in development
    hmr: isDev,
  },
};

/**
 * @type {import('webpack').Configuration}
 */
const electronRendererConfig = {
  mode: process.env.NODE_ENV,
  target: 'electron-renderer',
  devtool: '#cheap-module-eval-source-map',
  entry: {
    vendor: ['react', 'react-dom', 'lodash', 'mobx', 'mobx-react', 'antd'],
    ...scanGuiPlugins('renderer/index.ts'), // 插件先加载，将组件设置到 window.__plugins
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
          styleLoader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[folder]__[name]__[local]--[hash:base64:5]',
              },
              localsConvention: 'camelCase',
              sourceMap: true,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /^((?!\.m).)*\.scss$/,
        use: [
          styleLoader,
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
        use: [styleLoader, 'css-loader'],
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
    minimize: false,
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'all',
          test: 'vendor',
          name: 'vendor', // 使用 vendor 入口作为公共部分
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: rootResolve('src/gui/index.ejs'),
      nodeModules: isDev ? rootResolve('node_modules') : false,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};

if (isDev) {
  /**
   * Adjust rendererConfig for development settings
   */
  electronRendererConfig.plugins.push(
    new webpack.DefinePlugin({
      ...runtimePathDefine,
    }),
    new FriendlyErrorsWebpackPlugin(),
  );
} else {
  /**
   * Adjust rendererConfig for production settings
   */
  electronRendererConfig.devtool = '#source-map';

  electronRendererConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
  );
}

if (process.env.ANALYZER) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  electronRendererConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = electronRendererConfig;
