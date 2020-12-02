<template>
  <div style="width: 100vw; height: 100vh;">
    <AppNavBar title="Manage Crons" back="true" :showSetting="false"></AppNavBar>
    <b-container>
      <b-input-group prepend="daily cron" class="mt-3">
        <b-input
          v-model="dailyExpression"
          :state="validDailyExpression"
          type="text">
        </b-input>
        <b-input-group-append>
          <b-button :disabled="!validDailyExpression"
            @click="saveCron('daily', dailyExpression)">
            <b-icon icon="cloud-check"></b-icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>
      <b-input-group prepend="weekly cron" class="mt-3">
        <b-input
          v-model="weeklyExpression"
          :state="validWeeklyExpression"
          type="text">
        </b-input>
        <b-input-group-append>
          <b-button :disabled="!validWeeklyExpression"
            @click="saveCron('weekly', weeklyExpression)">
            <b-icon icon="cloud-check"></b-icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>
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
export default class ManageCrons extends Vue {
  dailyExpression = '* * * * *';
  validDailyExpression: boolean | null = null;
  weeklyExpression = '* * * * *';
  validWeeklyExpression: boolean | null = null;

  mounted() {
    axios.get('/api/configuration/cron/daily').then( res => {
      this.dailyExpression = res.data.cron;
      this.validDailyExpression = true;
    });
    axios.get('/api/configuration/cron/weekly').then( res => {
      this.weeklyExpression = res.data.cron;
      this.validWeeklyExpression = true;
    });
  }

  @Watch('dailyExpression')
  validateDailyChange() {
    this.validDailyExpression = null;
    this.validate(this.dailyExpression, (valid: boolean) => {
      this.validDailyExpression = valid;
    });
  }
  @Watch('weeklyExpression')
  validateWeeklyChange() {
    this.validWeeklyExpression = null;
    this.validate(this.weeklyExpression, (valid: boolean) => {
      this.validWeeklyExpression = valid;
    });
  }
  validate(expression: string, action: (valid: boolean) => void) {
    axios.post('/api/configuration/cron/test', { cron: expression }).then( res => {
      action(res.data.valid);
    });
  }

  saveCron(what: string, expression: string) {
    axios.post(`/api/configuration/cron/${what}`, { cron: expression });
  }
}
</script>

<style>
</style>