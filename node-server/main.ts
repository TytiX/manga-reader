import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cron from 'node-cron';

import scanAllSites, { scanChapter } from './scanners/site-scanner';
import apiRoutes from './routes/ApiRoute';
import { Database } from './database/Database';
import { WebpushUtils } from './utils/WebpushUtils';

const app = express();
const port = process.env.PORT || 3000; // default port to listen

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// define a route handler for the default home page
app.use( '/', express.static('public'));

WebpushUtils.generateIfNotExist();

const db = new Database();
db.connect().then( async () => {
  // start on boot
  scanAllSites(db, false);
  cron.schedule('0 9,12,15,19 * * *', () => {
    scanAllSites(db, false);
  }, {
    scheduled: true,
    timezone: 'Europe/Paris'
  });

  app.use('/api', apiRoutes(db));
});

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
});
