import ora from 'ora';
import { AppInfoService, HostService } from './../App/services';

const syncRemoteHosts = async () => {
  console.log('开始同步远程Host文件');
  const appInfoService = new AppInfoService(false);
  const hostService = new HostService(appInfoService);
  const hostFileList = hostService.getHostFileList('root');
  for (const hostFile of hostFileList) {
    if (!hostFile.meta) {
      continue;
    }
    if (!hostFile.meta.url || hostFile.meta.local) {
      continue;
    }
    const spinner = ora(`同步远程Host${hostFile.name}`).start();
    try {
      await hostService.importRemoteHostFile('root', hostFile.meta.url);
      spinner.succeed();
    } catch (e) {
      spinner.fail();
    }
  }
  console.log('同步远程Host文件结束');
};

export default syncRemoteHosts;
