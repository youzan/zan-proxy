export const APP_STATES = {
  STOP: {
    value: 0,
    text: '已停止',
  },
  INIT_PLUGINS: {
    value: 1,
    text: '正在检查并安装内部插件，请稍等...',
  },
  STARTING: {
    value: 10,
    text: '正在启动 Zan Proxy...',
  },
  INIT_MANAGER: {
    value: 20,
    text: '正在初始化工作区配置',
  },
  RUN: {
    value: 99,
    text: '正在运行',
  },
};
