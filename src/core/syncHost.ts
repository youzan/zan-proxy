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
    if (!hostFile.meta || hostFile.meta.local === true || !hostFile.meta.url) {
      continue;
    }

    console.info(`同步远程Host${hostFile.name}中`);
    try {
      await hostService.importRemoteHostFile(hostFile.meta.url);
      console.info(`同步远程Host${hostFile.name}成功`);
    } catch (e) {
      console.error(`同步远程Host${hostFile.name}失败`);
    }
  }
  console.log('同步远程Host文件结束');
};

export default syncRemoteHosts;
