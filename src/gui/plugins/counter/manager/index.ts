import { Container, Service } from 'typedi';

import BaseManager from '@gui/main/core/base-manager';
import { setIpcReplier } from '@gui/main/utils';
import { DEMO_EVENTS } from '../common/constants';

@Service()
class CounterManager extends BaseManager {
  openTimes = 0;

  public init() {
    setIpcReplier(DEMO_EVENTS.addOpenTimes, this.addOpenTimes);
    setIpcReplier(DEMO_EVENTS.fetchOpenTimes, this.fetchOpenTimes);
  }

  addOpenTimes = () => {
    this.openTimes++;
  };

  fetchOpenTimes = () => {
    return this.openTimes;
  };
}

export default {
  manager: Container.get(CounterManager),
};
