const path = require('path');

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
  },
  devServer: {
    inline: true,
    port: 8080,
    public: 'localhost:8080',
    writeToDisk: filepath => {
      return !filepath.includes('.hot-update.');
    },
  },
};
