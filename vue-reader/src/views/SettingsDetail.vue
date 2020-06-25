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

      <b-container>
        <b-row>
          <b-col md="6">
            <ConfigurationDetail
              :config="config"
              @submit-config="submitConfig"
              @reset-config="resetConfig">
            </ConfigurationDetail>
          </b-col>

          <b-col md="6">
            <ConfigurationScannerResult
              :loading="scannerLoad"
              :loadingChapters="scannerLoadChapters"
              :scanResult="scannerResult"
              :scannerChapter="scannerChapter"
              @load-manga-index="scanManga"
              @load-scan-chapter="scanChapter">
            </ConfigurationScannerResult>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import axios from 'axios';

import AppNavBar from '@/components/AppNavBar.vue';
import ConfigurationDetail from '@/components/settings/ConfigurationDetail.vue';
import ConfigurationScannerResult from '@/components/settings/ConfigurationScannerResult.vue';
import { ScannerConfig, Chapter } from '@/models';

@Component({
  components: {
    AppNavBar,
    ConfigurationScannerResult,
    ConfigurationDetail
  }
})
export default class SettingsDetail extends Vue {
  config: ScannerConfig = {};
  defaultConfigs: ScannerConfig[] = [];

  // eslint-disable-next-line
  scannerResult: any = {};
  scannerChapter: any = {};
  scannerLoad = false;
  scannerLoadChapters = false;

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

  @Watch('config')
  changeConfig() {
    this.scannerLoad = true;
    axios.post('/api/configuration/test-config', this.config).then( (res) => {
      this.scannerResult = res.data;
      this.scannerLoad = false;
    });
  }
  scanManga(index: number) {
    if (index > -1) {
      this.scannerLoad = true;
      this.scannerChapter = {};
      axios.post(`api/configuration/test-config/${index}`, this.config).then( (res) => {
        this.scannerResult = res.data;
        this.scannerLoad = false;
      });
    }
  }
  scanChapter(chapter: Chapter) {
    this.scannerLoadChapters = true;
    axios.post(`api/configuration/test-config/chapterScan`, chapter).then( (res) => {
      this.scannerChapter = res.data;
      this.scannerLoadChapters = false;
    });
  }

  submitConfig(config: ScannerConfig) {
    axios.post('/api/configuration', config).then( () => {
      this.$router.back();
    });
  }
  resetConfig() {
    this.config = {};
  }
}
</script>

<style>

</style>