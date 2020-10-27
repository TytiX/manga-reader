import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import {CronJob} from 'cron';

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
scanAllSites(true);
const task = new CronJob('0 0 8-18/4 * * *', async () => {
  try {
    await scanfavoritesPages();
    await scanAllSites(false);
  } catch (e) {
    logger.error(e);
  }
});
task.start();

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
});