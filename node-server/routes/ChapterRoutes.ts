import { Router } from "express";

import { Database } from "../database/Database";
import { scanChapters } from "../scanners/site-scanner";

export default (db: Database) => {
  const router = Router();

  router.get('/orphans', async function(req, res) {
    res.send(
      await db.chapterRepository.findAndCount({
        relations: [ 'source' ],
        where: {
          source: null
        }
      })
    );
  });
  router.delete('/orphans', async function(req, res) {
    const orphansChapters = await db.chapterRepository.find({
      relations: [ 'source' ],
      where: {
        source: null
      },
      take: 500
    });
    res.send(
      await db.chapterRepository.delete(orphansChapters.map(c => c.id))
    );
  });
  router.get('/:id', async function(req, res) {
    res.send(
      await db.findChapterById(req.params.id)
    );
  });
  router.get('/:id/next', async function(req, res) {
    res.send(
      await db.findNextChapterById(req.params.id)
    );
  });
  router.get('/:id/previous', async function(req, res) {
    res.send(
      await db.findPreviousChapterById(req.params.id)
    );
  });
  router.post('/', async function(req, res) {
    res.send(
      await db.findChapterByLink((req.body as any).link)
    );
  });
  router.post('/scan', async function(req, res) {
    scanChapters(db, req.body);
    res.send({
      status: 'running'
    });
  });

  return router;
}
