<template>
  <div>
    <AppNavBar title="Settings"></AppNavBar>
    <b-button to="/settings/new">Create config</b-button>
    <ConfigurationList :configs="configs"></ConfigurationList>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import ConfigurationList from '@/components/ConfigurationList.vue';
import { ScannerConfig } from '@/models';

@Component({
  components: {
    AppNavBar,
    ConfigurationList
  }
})
export default class Settings extends Vue {
  configs: ScannerConfig[] = [];
  mounted() {
    axios.get('/api/configuration').then( response => {
      this.configs = response.data;
    });
  }
}
</script>

<style>

</style>