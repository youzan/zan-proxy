import childProcess from 'child_process';
import { promisify } from 'es6-promisify';
import { prompt } from 'inquirer';
import ora from 'ora';
import selfupdate from 'selfupdate';

const packageInfo = require('../../package');
const update = promisify(selfupdate.update);
const isUpdated = promisify(selfupdate.isUpdated);
const exec = promisify(childProcess.exec);

export default async () => {
  const checkSpinner = ora('正在检查更新...').start();
  const isLatest = await isUpdated(packageInfo);
  checkSpinner.stop();
  if (isLatest) {
    console.log('当前已是最新版本');
    return;
  }
  const ans = await prompt([
    {
      message: '检测到新版本，是否更新？',
      name: 'shouldUpdate',
      type: 'confirm',
    },
  ]);
  if (!ans.shouldUpdate) {
    return;
  }
  const updateSpinner = ora('正在更新').start();
  return update(packageInfo)
    .catch(() => exec(`npm uninstall --global --silent ${packageInfo.name}`))
    .then(() => exec(`npm install --global --silent ${packageInfo.name}`))
    .then(() => {
      updateSpinner.stop();
      console.log(
        `更新完成，请重新启动! 如出现命令丢失情况，请手动重新安装：npm install -g ${
          packageInfo.name
        }`,
      );
      process.exit(0);
    })
    .catch(error => {
      console.error('更新失败', error);
      process.exit(1);
    });
};
