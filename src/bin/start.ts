import { Container } from 'typedi';
import App from '../App';

export default async (proxyPort?, uiPort?) => {
  const app = Container.get(App);
  await app.init();
  app.start(proxyPort, uiPort);

  process.on('unhandledRejection', (reason, p) => {
    if (process.env.DEBUG) {
      console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
    }
  });
  process.on('SIGINT', () => {
    process.exit();
  });
  process.on('uncaughtException', err => {
    if (process.env.DEBUG) {
      console.error(err);
    }
  });
};
