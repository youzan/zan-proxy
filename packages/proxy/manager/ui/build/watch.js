require('./check-versions')()

process.env.NODE_ENV = 'development'

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var webpackConfig = require('./webpack.watch.conf')

var spinner = ora('building for production...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  var compiler = webpack(webpackConfig);
  var watching = compiler.watch({
  }, function(err, stats) {

  });
});
