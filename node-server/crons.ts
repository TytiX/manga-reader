import cron from 'node-cron';

import { scanFavoritesAllSite, scanfavoritesPages, scanAllSites } from './scanners/site-scanner';

class CronTasks {

  dailyExpression = '0 8-21/10 * * *'
  weeklyExpression = '0 10 * * Sunday'

  daily;
  weekly;

  constructor() {
    this.daily = cron.schedule(this.dailyExpression, this.dailyCycle.bind(this));
    this.weekly = cron.schedule(this.weeklyExpression, this.weeklyCycle.bind(this));
  }

  dailyCycle() {
    scanfavoritesPages();
    scanFavoritesAllSite();
  }
  weeklyCycle() {
    scanAllSites();
  }

  start() {
    this.daily.start();
    this.weekly.start();
    this.dailyCycle();
  }

  getExpression(what: string) {
    switch(what) {
      case 'daily':
        return this.dailyExpression;
      case 'weekly':
        return this.weeklyExpression;
    }
  }
  updateCron(what: string, expression: string) {
    if (cron.validate(expression)) {
      switch(what) {
        case 'daily':
          this.daily.destroy();
          this.daily = cron.schedule(expression, this.dailyCycle.bind(this));
          this.daily.start();
          break;
        case 'weekly':
          this.weekly.destroy();
          this.weekly = cron.schedule(expression, this.weeklyCycle.bind(this));
          this.weekly.start();
          break;
      }
      return true;
    }
    return false;
  }
}

export default new CronTasks();
