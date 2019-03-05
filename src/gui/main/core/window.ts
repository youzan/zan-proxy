import * as path from 'path';
import { BrowserWindow } from 'electron';
import { Service } from 'typedi';

const winURL = global.isDev
  ? 'http://localhost:9080'
  : `file://${path.resolve(global.__static, '../index.html')}`;

@Service()
export default class WorkspaceWindow {
  private window: BrowserWindow = null;

  public send(channel: string, ...args: any[]) {
    this.window && this.window.webContents.send(channel, ...args);
  }

  public open() {
    if (this.window) {
      return;
    }

    // 区分开发和生产静态资源路径
    this.window = new BrowserWindow({
      width: 940,
      height: 700,
      useContentSize: true,
      webPreferences: {
        webSecurity: false,
      },
    });

    this.window.loadURL(winURL);
    this.window.on('closed', () => {
      this.window = null;
    });
  }
}
