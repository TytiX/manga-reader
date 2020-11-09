import { Router } from 'express';

import { Database } from '../database/Database';
import axios from 'axios';
import logger from '../logger';

export default (db: Database) => {
  const router = Router();

  router.get('/fromUrl/:url', async (req, res) => {
    logger.debug(`ImageAPI --> get image from ${req.params.url}`);
    try {
      const response = await axios.get(
        req.params.url,
        { responseType: 'stream' }
      );
      response.data.pipe(res);
    } catch (e) {
      res.status(500).send(e)
    }
  });

  router.post('/fromUrl', async (req, res) => {
    logger.debug(`ImageAPI --> psot image from ${req.body.url}`);
    try {
      const response = await axios.get(
        req.body.url,
        { responseType: 'stream' }
      );
      response.data.pipe(res);
    } catch (e) {
      res.status(500).send(e)
    }
  });

  router.get('/:chapterId/:pageNumber', async (req, res) => {
    logger.debug(`ImageAPI --> get image from ${req.params.chapterId}, page ${req.params.pageNumber}`);
    try {
      const chapter = await db.findChapterById(req.params.chapterId);
      const response = await axios.get(
        chapter.pages.find(
          p => p.number = Number(req.params.pageNumber)
        ).url,
        { responseType:'stream' }
      );
      response.data.pipe(res);
    } catch (e) {
      res.status(500).send(e)
    }
  });

  return router;
}
