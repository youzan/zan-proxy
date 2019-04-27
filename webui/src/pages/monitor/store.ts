import Vue from 'vue';
import Vuex from 'vuex';

import { IClientRecord, IRecordMap, IRootState } from './types';

Vue.use(Vuex);


const store = new Vuex.Store<IRootState>({
  state: {
    recordMap: {},
    filteredIds: [],
    selectId: '',
  },
  getters: {
    hasCurrent(state) {
      return !!state.recordMap[state.selectId];
    },
    currentRecord(state) {
      return state.recordMap[state.selectId];
    },
  },
  mutations: {
    setRecordMap(state, recordMap: IRecordMap) {
      state.recordMap = recordMap;
    },
    modifyRecordMap(state, payload: { id: number; record: IClientRecord }) {
      state.recordMap[payload.id] = payload.record;
    },
    setFilteredIds(state, filteredIds: number[]) {
      state.filteredIds = filteredIds;
    },
    addFilteredId(state, id: number) {
      state.filteredIds.push(id);
    },
    setSelectId(state, selectId: string) {
      state.selectId = selectId;
    },
    clear(state) {
      state.recordMap = {};
      state.selectId = '';
      state.filteredIds = [];
    },
  },
  actions: {},
  strict: process.env.NODE_ENV !== 'production',
});

export default store;
