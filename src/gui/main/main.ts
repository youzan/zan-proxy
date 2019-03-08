import { app } from 'electron';
import logger from 'electron-log';
import { Container } from 'typedi';

import createMenus from './menu';
import { showNotify } from '@gui/main/utils';
import Application from '@gui/main/core/application';
import * as config from '../config';

import resetDataFiles from '@core/resetDataFiles';

// 阻止程序退出
app.on('window-all-closed', e => e.preventDefault());

app.on('ready', createMenus);

app.on('ready', async () => {
  try {
    resetDataFiles();
    // 异步初始化工作区信息
    const zanProxyApp = Container.get(Application);
    await zanProxyApp.loadPlugins(config.plugins);
    await zanProxyApp.init();
  } catch (e) {
    logger.error(e);
    showNotify({
      title: 'Zan Proxy 启动失败！',
      body: '请检查是否端口冲突或出现其他原因',
    });
    app.exit(-1);
  }
});
