import Vue from 'vue';
import Vuex from 'vuex';
import { namespace } from 'vuex-class';
import profile from './profile';
import mock from './mock';
import host from './host';
import rule from './rule';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    profile,
    mock,
    host,
    rule,
  },
});

export default store;

export const profileModule = namespace('profile');
export const mockModule = namespace('mock');
export const hostModule = namespace('host');
export const ruleModule = namespace('rule');
