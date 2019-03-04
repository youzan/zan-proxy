import { Container } from 'typedi';
import App from '../App';

export default async (proxyPort?, uiPort?) => {
  const app = Container.get(App);
  await app.init();
  app.start(proxyPort, uiPort);
};
