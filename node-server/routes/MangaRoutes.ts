import { Router } from "express";

import { Database } from "../database/Database";

export default (db: Database) => {
  const router = Router();
  router.get('/', async function(req, res) {
    res.send(
      await db.allMangas()
    );
  });
  router.post('/search', async function(req, res) {
    res.send(
      await db.mangaByTags(req.body.tags)
    )
  });
  router.get('/:id', async function(req, res) {
    res.send(
      await db.findMangaById(req.params.id)
    );
  });
  return router;
}
