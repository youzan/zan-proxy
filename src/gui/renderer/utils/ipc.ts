import { ipcRenderer } from 'electron';

/**
 * renderer 进程与 main 进程建议使用 ipc 通信，而不是 renderer 进程直接发送 ajax 请求
 * 封装了一个简单的通信方法：
 *  1. 接收 channel 和参数，并向对应 channel 发送参数
 *  2. 监听 ${channel}:reply 通道，等待响应
 *  3. 根据响应结果 resolve 或 reject Promise
 */
export function ipcSend<R = any>(channel: string, ...reqArgs: any[]) {
  return new Promise<R>((resolve, reject) => {
    ipcRenderer.once(`${channel}:reply`, (event, res: ZanProxyMac.IIpcReplay) => {
      res.success === true ? resolve(res.data) : reject(res.message);
    });
    ipcRenderer.send(channel, ...reqArgs);
  });
}
