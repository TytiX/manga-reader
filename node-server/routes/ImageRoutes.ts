import { Router } from 'express';

import { http } from '../utils/Http';
import { Database } from '../database/Database';
import logger from '../logger';
import cache from '../utils/cache';

async function getImage(url: string) {
  const key = url;
  if (cache.exists(key)) {
    return cache.get(key)
  } else {
    const response = await http.stream(url);
    cache.put(key, response);
    return response;
  }
}

export default (db: Database) => {
  const router = Router();

  router.get('/fromUrl/:url', async (req, res) => {
    logger.debug(`ImageAPI --> get image from ${req.params.url}`);
    try {
      const img = await getImage(req.params.url)
      img.pipe(res);
    } catch (e) {
      res.status(500).send(e)
    }
  });

  router.post('/fromUrl', async (req, res) => {
    logger.debug(`ImageAPI --> post image from ${req.body.url}`);
    try {
      const img = await getImage(req.body.url)
      img.pipe(res);
    } catch (e) {
      res.status(500).send(e)
    }
  });

  router.get('/:chapterId/:pageNumber', async (req, res) => {
    logger.debug(`ImageAPI --> get image from ${req.params.chapterId}, page ${req.params.pageNumber}`);
    try {
      const chapter = await db.findChapterById(req.params.chapterId);
      const response = await http.stream(chapter.pages.find(
        p => p.number = Number(req.params.pageNumber)
      ).url);
      response.pipe(res);
    } catch (e) {
      res.status(500).send(e)
    }
  });

  return router;
}
