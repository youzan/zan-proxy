import Install from './Help/Install';
import ProjectPath from './ProjectPath';
import Hosts from './Hosts';

export default [
  {
    path: '/helpinstall',
    component: Install,
  },
  {
    path: '/projectpath',
    component: ProjectPath,
  },
  {
    path: '/hosts',
    component: Hosts
  }
];
