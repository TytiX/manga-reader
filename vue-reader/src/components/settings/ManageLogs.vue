<template>
  <div style="width: 100vw; height: 100vh;">
    <AppNavBar title="Manage Logs" back="true" :showSetting="false"></AppNavBar>
    <b-container style="height: calc(100% - 56px);">
      <b-row style="height: 100%">
        <b-col>
          <b-form-select
            class="mt-3"
            v-model="selectedLogLevel"
            :options="logLevels">
          </b-form-select>
          <!-- {{ logfiles }} -->
          <b-form-select
            class="mt-3"
            v-model="selectedLogfile"
            :options="logfiles">
          </b-form-select>
          {{filecontent}}
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';

@Component({
  components: {
    AppNavBar
  }
})
export default class ManageLogs extends Vue {
  selectedLogLevel = 'info';
  logLevels = [
    'debug',
    'info',
    'warn',
    'error'
  ];

  selectedLogfile = '';
  logfiles = [];

  filecontent = '';

  mounted() {
    this.getLogLevel();
    this.loadLogfile();
  }

  getLogLevel() {
    axios.get('/api/configuration/logger/level').then( res => {
      this.selectedLogLevel = res.data;
    });
  }

  loadLogfile() {
    axios.get('/api/configuration/logger').then( res => {
      this.logfiles = res.data.map( (d: any) => {
        return d.relativePath;
      });
    });
  }

  @Watch('selectedLogLevel')
  changeLogLevel() {
    axios.get(`/api/configuration/logger/${this.selectedLogLevel}`).then( () => {
      // nothing
    });
  }

  @Watch('selectedLogfile')
  changeLogFile() {
    this.filecontent = '';
    axios.get(`/api/configuration/tail/${this.selectedLogfile}`).then( (res) => {
      // nothing
      res.data.on('data', (line: string) => {
        this.filecontent += '\n'+line;
      })
    });
  }
}
</script>

<style>
</style>