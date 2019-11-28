<template>
  <div class="other-setting-page">
    <div class="main-content__title">其他设置</div>
    <el-form label-position="left" label-width="140px" class="form">
      <el-form-item label="二次转发服务器:">
        <el-input class="custom-proxy-input" v-model="profile.customProxy" placeholder="请输入二次转发服务器地址" />
        <p class="form-help-desc">若服务器地址为空，则不进行二次转发</p>
      </el-form-item>
      <el-form-item label-width="0">
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { setCustomProxy } from '../../api/profile';
import { profileModule } from '../../store';
import { IProfile } from '@core/types/profile';

@Component
export default class OtherSetting extends Vue {
  @profileModule.State('profile')
  profile: IProfile;

  async save() {
    try {
      await setCustomProxy(this.profile.customProxy!);
      this.$message.success('保存成功!');
    } catch (err) {
      this.$message.error(err);
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  &-help-desc {
    font-size: 12px;
    color: #666;
  }
}

.custom-proxy-input {
  width: 300px;
}
</style>
