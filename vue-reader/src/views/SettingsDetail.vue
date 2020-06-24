<template>
  <div style="width: 100vw; height: 100vh;">
    <AppNavBar title="Settings" back="true" :showSetting="false">
      <!-- <b-nav-item @click="submitConfig"><b-icon icon="file-earmark-arrow-down"></b-icon></b-nav-item> -->
    </AppNavBar>

    <div style="height: calc(100% - 56px);" class="scrollable">
      <div
        v-if="$route.params.id === 'new'"
        class="container mt-3 mb-3">
        <h3>Default presets</h3>
        <b-form-select
          v-model="config"
          :options="defaultConfigs">
        </b-form-select>
      </div>

      <ConfigurationDetail
        :config="config"
        @submit-config="submitConfig"
        @reset-config="resetConfig">
      </ConfigurationDetail>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import ConfigurationDetail from '@/components/settings/ConfigurationDetail.vue';
import { ScannerConfig } from '@/models';

@Component({
  components: {
    AppNavBar,
    ConfigurationDetail
  }
})
export default class SettingsDetail extends Vue {
  config: ScannerConfig = {};
  defaultConfigs: ScannerConfig[] = [];

  mounted() {
    if (this.$route.params.id !== 'new') {
      axios.get('/api/configuration/' + this.$route.params.id).then( response => {
        this.config = response.data;
      });
    } else {
      axios.get('/api/configuration/default').then( response => {
        this.defaultConfigs = response.data.map( (c: ScannerConfig) => {
          return { value: c, text: c.name};
        });
      });
    }
  }

  submitConfig(config: ScannerConfig) {
    console.log(this.config);
    axios.post('/api/configuration', config).then( () => {
      this.$router.go(-1);
    });
  }
  resetConfig() {
    this.config = {};
  }
}
</script>

<style>

</style>