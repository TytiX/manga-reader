import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cron from 'node-cron';

import scanAllSites from './site-scanner';
import apiRoutes from './routes/ApiRoute';

scanAllSites();
cron.schedule('0 9,15,19 * * *', () => {
  scanAllSites();
}, {
  scheduled: true,
  timezone: 'Europe/Paris'
});

const app = express();
const port = process.env.PORT || 3000; // default port to listen

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// define a route handler for the default home page
app.use( '/', express.static('public'));

app.use('/api', apiRoutes());

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
});
