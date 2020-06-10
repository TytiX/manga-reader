import "reflect-metadata";
import * as express from 'express';
import * as bodyParser from "body-parser";

import scanAllSites from './site-scanner';
import apiRoutes from './routes/ApiRoute';

scanAllSites();

const app = express();
const port = process.env.PORT || 3000; // default port to listen

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
} );

app.use('/api', apiRoutes());

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
});
