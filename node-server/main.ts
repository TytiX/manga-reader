import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';

import apiRoutes from './routes/ApiRoute';
import { WebpushUtils } from './utils/WebpushUtils';
import logger from './logger';
import crons from './crons';

const app = express();
const port = process.env.PORT || 3000; // default port to listen

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// define a route handler for the default home page
app.use( '/', express.static('public'));

WebpushUtils.generateIfNotExist();

app.use('/api', apiRoutes());

crons.start();

// start the express server
app.listen( port, () => {
    logger.info( `server started at http://localhost:${ port }` );
});
