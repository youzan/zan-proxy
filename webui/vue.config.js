const path = require('path');
const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');
const rootResolve = (...ps) => path.resolve(__dirname, '../', ...ps);

module.exports = {
  lintOnSave: false,
  outputDir: rootResolve('site'),
  assetsDir: 'static',
  pages: {
    manager: {
      entry: 'src/pages/manager/index.ts',
      template: 'index.html',
      filename: 'manager.html',
      title: 'ZanProxy Admin Manager',
      chunks: ['chunk-vendors', 'chunk-common', 'manager'],
    },
    monitor: {
      entry: 'src/pages/monitor/index.ts',
      template: 'index.html',
      filename: 'monitor.html',
      title: 'ZanProxy Monitor',
      chunks: ['chunk-vendors', 'chunk-common', 'monitor'],
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@core': rootResolve('src/core'),
        '@webui': rootResolve('src/webui'),
      },
    },
    plugins: [
      new MonacoEditorWebpackPlugin({
        languages: ['html', 'json', 'javascript', 'typescript'],
        features: [
          'accessibilityHelp',
          'bracketMatching',
          'find',
          'folding',
          'format',
          'hover',
          'inPlaceReplace',
          'inspectTokens',
          'multicursor',
          'parameterHints',
          'smartSelect',
          'suggest',
          'wordHighlighter',
        ],
      }),
    ],
  },
  devServer: {
    host: '127.0.0.1',
    port: 8081,
    inline: true,
    public: '127.0.0.1:8081',
    writeToDisk: filepath => {
      return !filepath.includes('.hot-update.');
    },
  },
};
