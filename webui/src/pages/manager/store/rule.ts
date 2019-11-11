import { Module } from 'vuex';
import { IRuleFile } from '@core/types/rule';

export interface IRuleState {
  list: IRuleFile[];
}

const host: Module<IRuleState, any> = {
  namespaced: true,
  state: {
    list: [],
  },

  mutations: {
    update(state, ruleList: IRuleFile[]) {
      state.list = ruleList;
    },
  },
};

export default host;
