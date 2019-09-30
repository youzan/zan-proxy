const webpack = require('webpack');
const nodemon = require('nodemon');
const webpackConfig = require('./webpack.cli.config');

process.on('SIGINT', function() {
  process.exit(0);
});

const startNodemon = () => {
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
};

function watch() {
  webpackConfig.mode = 'development';
  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.watch({}, (err, stats) => {
      if (err) {
        return reject(err);
      }

      resolve(stats);
    });
  });
}

watch()
  .then(() => {
    startNodemon();
  })
  .catch(err => {
    console.error(err);
  });
