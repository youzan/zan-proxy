import logger from 'electron-log';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'antd/dist/antd.css';
import './global.scss';

import App from './App';
import store from './store';

window.addEventListener('unhandledrejection', err => logger.error(err));
window.addEventListener('error', err => logger.error(err));

configure({
  enforceActions: process.env.NODE_ENV !== 'production' ? 'observed' : 'never',
});

ReactDOM.render(
  <Provider {...store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
