import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import cron from 'node-cron';

import { scanFavoritesAllSite, scanfavoritesPages, scanAllSites } from './scanners/site-scanner';
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

const mainCycle = () => {
  scanfavoritesPages();
  scanFavoritesAllSite();
}
const weaklyCycle = () => {
  scanAllSites();
}

// start on boot
mainCycle();

cron.schedule('0 8-21/10 * * *', (() => {
  mainCycle();
}).bind(this), {
  scheduled: true
});

cron.schedule('0 10 * * Sunday', (() => {
  weaklyCycle();
}).bind(this), {
  scheduled: true
});

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    logger.info( `server started at http://localhost:${ port }` );
});