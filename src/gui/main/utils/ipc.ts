import { Event, ipcMain } from 'electron';
import logger from 'electron-log';

type IIpcSendHandler = (...args: any[]) => any;

/**
 * ipc 请求处理封装函数
 *
 * @export
 * @param channel 通讯信道名称
 * @param handler 处理方法, 可以是一个 async 函数,
 * 接收参数为 renderer 进程传递过来的所有参数, 将返回结果封装为指定格式后返回给 renderer 进程
 * ```ts
 * // 执行正常响应封装
 * interface SuccessRes {
 *   success: true;
 *   data: any;
 * }
 *
 * // 执行异常响应封装
 * interface FailedRes {
 *   success: false;
 *   message: any;
 * }
 * ```
 * @returns 取消订阅方法
 */
export function setIpcReplier(channel: string, handler: IIpcSendHandler) {
  const replyChannel = `${channel}:reply`;
  const listener = async (event: Event, ...args: any[]) => {
    try {
      const data = await handler(...args);
      event.sender.send(replyChannel, { success: true, data });
    } catch (err) {
      logger.info(`channel ${channel} requests execute error:`, err);
      event.sender.send(replyChannel, { success: false, message: err.message });
    }
  };

  ipcMain.on(channel, listener);

  return () => {
    ipcMain.removeListener(channel, listener);
  };
}
