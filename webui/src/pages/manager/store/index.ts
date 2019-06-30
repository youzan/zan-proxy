import Vue from 'vue';
import Vuex from 'vuex';
import { namespace } from 'vuex-class';
import profile from './profile';
import mock from './mock';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    profile,
    mock,
  },
});

export default store;

export const profileModule = namespace('profile');
export const mockModule = namespace('mock');
