import { map } from 'lodash';
import { Module } from 'vuex';

import { IProfile } from '@core/types/profile';

export interface IProjectPath {
  key: string;
  value: string;
}

export interface IProfileState {
  // 个人配置
  profile: IProfile;
  // 将转发变量配置转换为数组格式 方便编辑
  projectPathArray: IProjectPath[];
}

const profile: Module<IProfileState, any> = {
  namespaced: true,
  state: {
    // 个人配置
    profile: {
      enableRule: false,
      enableHost: false,
      projectPath: {},
      customProxy: '',
    },
    // 将转发变量配置转换为数组格式 方便编辑
    projectPathArray: [],
  },

  mutations: {
    update(state, profile: IProfile) {
      state.profile = profile;
      state.projectPathArray = map(profile.projectPath, (value, key) => ({ key, value }));
    },
  },
};

export default profile;
