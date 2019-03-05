/**
 * 入口文件
 */
import * as path from 'path';
import logger from 'electron-log';

if (process.env.NODE_ENV === 'development') {
  // 开发模式下，关闭日志文件输出
  logger.transports.file.level = false;
} else {
  logger.transports.console.level = false;
  global.__root = path.resolve(__dirname, '../');
  global.__static = path.resolve(__dirname, '/static');
  global.__resource = path.resolve(__dirname, '../../../resources');
}

process.on('unhandledRejection', err => {
  logger.error('unhandledRejection', err);
});

process.on('uncaughtException', err => {
  logger.error('uncaughtException', err);
});

// load dev and main file
import('./main');
