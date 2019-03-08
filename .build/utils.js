const path = require('path');
const fs = require('fs-extra');

/**
 * @param {string[]} ps
 * @returns {string}
 */
const rootResolve = (...ps) => path.resolve(__dirname, '..', ...ps);

const runtimePathDefine = {
  'global.__root': `"${rootResolve('')}"`,
  'global.__static': `"${rootResolve('static')}"`,
  'global.__resource': `"${rootResolve('resource')}"`,
  'global.__site': `"${rootResolve('site')}"`,
};

const webpackAlias = {
  '@core': rootResolve('src/core'),
  '@gui': rootResolve('src/gui'),
  '@cli': rootResolve('src/cli'),
}

/**
 * 扫描插件 renderer 入口
 */
const scanGuiPlugin = (entryRelativePath) => {
  const pluginRoot = rootResolve('src/gui/plugins');
  const plugins = fs.readdirSync(pluginRoot);
  const entries = {};
  plugins.forEach(plugin => {
    const filePath = path.join(pluginRoot, plugin, entryRelativePath);
    if (fs.existsSync(filePath)) {
      entries[plugin] = filePath;
    }
  });
  return entries;
}

module.exports = {
  rootResolve,
  runtimePathDefine,
  webpackAlias,
  scanGuiPlugin,
};
