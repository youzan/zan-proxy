const path = require('path');

/**
 * @param {string[]} ps
 * @returns {string}
 */
const rootResolve = (...ps) => path.resolve(__dirname, '..', ...ps);

const runtimePathDefine = {
  __root: `"${rootResolve('')}"`,
  __static: `"${rootResolve('static')}"`,
  __resource: `"${rootResolve('resources')}"`,
  __site: `"${rootResolve('site')}"`,
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
