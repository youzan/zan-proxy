import { Container } from 'typedi';

import App from './App';

export default async (proxyPort: number = 8001, uiPort: number = 40001) => {
  const app = Container.get(App);
  await app.init();
  app.start(proxyPort, uiPort);
};
