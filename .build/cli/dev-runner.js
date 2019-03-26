const webpack = require('webpack');
const nodemon = require('nodemon');
const webpackConfig = require('./webpack.cli.config');

process.on('SIGINT', function(){
  process.exit(0);
});

const startNodemon = (function() {
  let started = false;

  function startNodemon() {
    if (started) {
      return;
    }

    nodemon({
      verbose: true,
      delay: '500',
      env: {
        NODE_ENV: 'development',
      },
      watch: ['dist'],
      exec: `node dist/main.js ${process.argv.slice(2).join(' ')}`,
    }).on('start', () => {
      console.log('nodemon started.');
      started = true;
    });
  }

  return startNodemon;
})();

function watch() {
  webpackConfig.mode = 'development';
  const compiler = webpack(webpackConfig);

  compiler.watch({}, (err, stats) => {
    if (err) {
      console.log(err);
      return;
    }

    startNodemon();
  });
}

watch();
