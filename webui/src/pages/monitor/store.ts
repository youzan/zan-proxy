import { IRecord } from '@core/types/http-traffic';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export interface IRecordMap {
  [id: string]: IRecord;
}

export interface IRootState {
  recordMap: IRecordMap; // 当前所有记录
  filteredIds: number[]; // 过滤后的数组 存放记录id
  selectId: string; // 当前选择的记录
}

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
    modifyRecordMap(state, payload: { id: number; record: IRecord }) {
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
