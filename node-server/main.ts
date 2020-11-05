import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
// import { CronJob } from 'cron';
import * as cron from 'node-cron';

import scanAllSites, { scanfavoritesPages } from './scanners/site-scanner';
import apiRoutes from './routes/ApiRoute';
import { WebpushUtils } from './utils/WebpushUtils';
import logger from './logger';

const app = express();
const port = process.env.PORT || 3000; // default port to listen

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// define a route handler for the default home page
app.use( '/', express.static('public'));

WebpushUtils.generateIfNotExist();

app.use('/api', apiRoutes());

// start on boot
scanfavoritesPages();
scanAllSites();
// const task = new CronJob('0 8-21/10 * * *', async () => {
cron.schedule('0 8-21/10 * * *', () => {
  try {
    scanfavoritesPages();
    scanAllSites();
  } catch (e) {
    logger.error(e);
  }
}, {
  scheduled: true,
  timezone: 'Europe/Paris'
});
// }, () => {
//   logger.error('Finish cron job sould not be triggered');
// }, true, 'Europe/Paris');
// task.start(); -- should be auto

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
});