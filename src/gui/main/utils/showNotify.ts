/**
 * 工具函数
 */
import { NotificationConstructorOptions, Notification } from 'electron';

/**
 * 弹出右上角的消息框
 *
 *  @export
 * @param {NotificationConstructorOptions} notifyOptions
 */
export function showNotify(notifyOptions: NotificationConstructorOptions, show: boolean = true) {
  const notify = new Notification({
    silent: true,
    ...notifyOptions,
  });
  if (show) {
    notify.show();
  }
  return notify;
}
