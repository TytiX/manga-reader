import { Router } from 'express';
import { Database } from '../database/Database';

export default () => {

  const router = Router();

  const db = new Database();
  db.connect().then( () => {
    // define the home page route
    router.get('/manga', async function(req, res) {
      res.send(
        await db.allMangas()
      );
    });
    // define the about route
    router.get('/manga/:id', async function(req, res) {
      res.send(
        await db.findMangaById(req.params.id)
      );
    });
    // define the about route
    router.get('/source/:id', async function(req, res) {
      res.send(
        await db.findSourceById(req.params.id)
      );
    });
  });

  return router;
}
