import fs from 'fs';
import 'mocha';
import path from 'path';
import os from 'os';
import rimraf from 'rimraf';
import { AppInfoService, ProfileService } from '../../../src/core/services';

describe('ProfileService', () => {
  const appInfoService = new AppInfoService();
  let profileService: ProfileService = null;
  before(() => {
    if (!fs.existsSync(os.homedir())) {
      fs.mkdirSync(os.homedir());
    }
    const dataDir = path.join(os.homedir(), '.front-end-proxy');
    fs.mkdirSync(dataDir);
    const dir = path.join(dataDir, 'profile');
    fs.mkdirSync(dir);
    const resetProfile = {
      enableHost: true,
      enableRule: true,
      projectPath: {
        youzan: '/mytest/youzan',
      },
    };
    fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify(resetProfile), { encoding: 'utf-8' });
    profileService = new ProfileService(appInfoService);
  });
  after(() => rimraf.sync(os.homedir()));

  it('should get the correct path', done => {
    const p = profileService.calcPath('http://www.youzan.com', '(.+).youzan.com', '<%=youzan%>/test/$1');
    p.should.includes('/mytest/youzan/test');
    p.should.includes('www');
    done();
  });
});
