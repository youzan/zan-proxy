import { get } from 'lodash';
import ora from 'ora';
import Container from 'typedi';

import { HostService } from './services';

/**
 * 同步远程 Host 规则
 */
const syncRemoteHosts = async () => {
  console.log('开始同步远程Host文件');
  const hostService = Container.get(HostService);
  const hostFileList = hostService.getHostFileList();
  for (const hostFile of hostFileList) {
    const meta = get(hostFile, 'meta');
    if (!meta || meta.local === true || !meta.url) {
      continue;
    }

    const spinner = ora(`同步远程Host${hostFile.name}中`).start();
    try {
      await hostService.importRemoteHostFile(meta.url);
      spinner.succeed(`同步远程Host${hostFile.name}成功`);
    } catch (e) {
      spinner.fail(`同步远程Host${hostFile.name}失败`);
    }
  }
  console.log('同步远程Host文件结束');
};

export default syncRemoteHosts;
