import 'reflect-metadata';

import * as logger from 'electron-log';
import * as path from 'path';

if (process.env.NODE_ENV === 'development') {
  // 开发模式下，关闭日志文件输出
  logger.transports.file.level = false;
} else {
  logger.transports.console.level = false;
  console.info = logger.info.bind(logger);
  console.log = logger.info.bind(logger);
  console.error = logger.error.bind(logger);
  console.debug = logger.debug.bind(logger);
  console.warn = logger.warn.bind(logger);
  global.__root = path.resolve(__dirname, '../');
  global.__site = path.resolve(__dirname, '../site');
  global.__static = path.resolve(__dirname, '../static');
  global.__resource = path.resolve(__dirname, '../../resource');
}

process.on('unhandledRejection', err => {
  logger.error('unhandledRejection', err);
});

process.on('uncaughtException', err => {
  logger.error('uncaughtException', err);
});
