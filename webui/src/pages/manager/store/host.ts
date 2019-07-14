import { Module } from 'vuex';
import { IHostFile } from '@core/types/host';

export interface IHostState {
  list: IHostFile[];
}

const host: Module<IHostState, any> = {
  namespaced: true,
  state: {
    list: [],
  },

  mutations: {
    update(state, hostList: IHostFile[]) {
      state.list = hostList;
    },
  },
};

export default host;
