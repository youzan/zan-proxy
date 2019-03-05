/**
 * 入口文件
 */
import * as path from 'path';
import logger from 'electron-log';
import * as moduleAlias from 'module-alias';

global.isDev = process.env.NODE_ENV === 'development';

if (global.isDev) {
  // 开发模式下，关闭日志文件输出
  logger.transports.file.level = false;
  global.__root = path.resolve(__dirname, '../../');
  global.__static = path.resolve(__dirname, '../../static');
  global.__resource = path.resolve(__dirname, '../../resources');
} else {
  logger.transports.console.level = false;
  global.__root = path.resolve(__dirname, '../../');
  global.__static = path.resolve(__dirname, '../static');
  global.__resource = path.resolve(__dirname, '../../../resources');
}
// runtime tsconfig path resolve
moduleAlias.addAliases({
  '@gui/common': path.resolve(global.__root, 'dist/common'),
  '@gui/main': path.resolve(global.__root, 'dist/main'),
});

process.on('unhandledRejection', err => {
  logger.error('unhandledRejection', err);
});

process.on('uncaughtException', err => {
  logger.error('uncaughtException', err);
});

// load dev and main file
(async () => {
  try {
    if (global.isDev) {
      await import('./dev');
    }
    await import('./main');
  } catch (err) {
    logger.error('加载文件出错:', err);
  }
})();
