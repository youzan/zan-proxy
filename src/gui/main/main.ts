import { app } from 'electron';
import logger from 'electron-log';
import { Container } from 'typedi';

import { migrateFromOld, resetDataFiles } from '@core/resetDataFiles';
import { showNotify } from '@gui/main/utils';

import createMenus from './menu';

import * as config from '../config';

// 阻止程序退出
app.on('window-all-closed', e => e.preventDefault());

app.on('ready', createMenus);

app.on('ready', async () => {
  try {
    migrateFromOld();
    resetDataFiles();
    // 异步加载应用主体，初始化工作区信息
    const Application = (await import('@gui/main/core/application')).default;
    const zanProxyApp = Container.get(Application);
    await zanProxyApp.loadPlugins(config.plugins);
    await zanProxyApp.init();
  } catch (e) {
    logger.error(e);
    showNotify({
      title: 'Zan Proxy 启动失败！',
      body: '请检查是否配置文件是否正常，是否有端口冲突或其他原因',
    });
    app.exit(-1);
  }
});
