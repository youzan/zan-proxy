import { app } from 'electron';
/**
 * 开发模式
 */
import electronDebug from 'electron-debug';
import installExtension, { MOBX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

// close electron security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Install `electron-debug` with `devtron`
electronDebug({ showDevTools: true });

// Install `vue-devtools`
app.on('ready', () => {
  installExtension([REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS]).catch((err: Error) => {
    // tslint:disable-next-line:no-console
    console.error('Unable to install devtools: \n', err);
  });
});
