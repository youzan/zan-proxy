import { Module } from 'vuex';
import { IMockRecord } from '@core/types/mock';

export interface IMockState {
  dataList: IMockRecord[];
}

const mock: Module<IMockState, any> = {
  namespaced: true,
  state: {
    dataList: [],
  },

  mutations: {
    update(state, dataList: IMockRecord[]) {
      state.dataList = dataList;
    },
  },
};

export default mock;
