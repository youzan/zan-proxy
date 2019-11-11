import { Module } from 'vuex';
import { IMockRecord } from '@core/types/mock';

export interface IMockState {
  list: IMockRecord[];
}

const mock: Module<IMockState, any> = {
  namespaced: true,
  state: {
    list: [],
  },

  mutations: {
    update(state, dataList: IMockRecord[]) {
      state.list = dataList;
    },
  },
};

export default mock;
