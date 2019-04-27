import * as path from 'path';

const HOME_DIR = process.env.HOME || (process.env.USERPROFILE as string);
/**
 * 获取主目录下的文件路径
 *
 * @export
 * @param {...string[]} p
 * @returns
 */
export function homePath(...p: string[]) {
  return path.resolve(HOME_DIR, ...p);
}
