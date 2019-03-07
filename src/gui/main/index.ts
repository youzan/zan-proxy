import 'reflect-metadata';
import * as path from 'path';
import logger from 'electron-log';
import promiseFinally from 'promise.prototype.finally';

promiseFinally.shim();

if (process.env.NODE_ENV === 'development') {
  // 开发模式下，关闭日志文件输出
  logger.transports.file.level = false;
} else {
  logger.transports.console.level = false;
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
