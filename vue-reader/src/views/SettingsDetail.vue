<template>
  <div>
    <AppNavBar title="Settings"></AppNavBar>

    <div
      v-if="$route.params.id === 'new'"
      class="container mt-3 mb-3">
      <h3>Default presets</h3>
      <b-form-select
        v-model="config"
        :options="defaultConfigs">
      </b-form-select>
    </div>

    <ConfigurationDetail :config="config"></ConfigurationDetail>
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
}
</script>

<style>

</style>