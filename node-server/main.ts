import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cron from 'node-cron';

import scanAllSites, { scanfavoritesPages } from './scanners/site-scanner';
import apiRoutes from './routes/ApiRoute';
import { WebpushUtils } from './utils/WebpushUtils';

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
const task = cron.schedule('0 8,12,16,18 * * *', async () => {
  await scanfavoritesPages();
  await scanAllSites(false);
}, {
  scheduled: true,
  timezone: 'Europe/Paris'
});
task.start();

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
});