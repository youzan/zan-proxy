const path = require('path');

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

module.exports = {
  rootResolve,
  runtimePathDefine,
  webpackAlias,
};
