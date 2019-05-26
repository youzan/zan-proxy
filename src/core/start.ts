import { Container } from 'typedi';
import ip from 'ip';

import App from './application';

export default async function start(
  proxyPort: number = 8001,
  managerPort: number = 40001,
  managerHost: string = ip.address(),
) {
  const app = Container.get(App);
  await app.init(proxyPort, managerPort, managerHost);
  app.start();
}
