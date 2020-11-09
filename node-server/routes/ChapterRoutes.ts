import { Router } from 'express';

import { Database } from '../database/Database';
import logger from '../logger';
import { scanChapterPages } from '../scanners/scanner-store';

export default (db: Database) => {
  const router = Router();

  router.get('/orphans', async (req, res) => {
    logger.debug(`ChapterAPI --> orphans chapters`);
    res.send(
      await db.chapterRepository.findAndCount({
        relations: [ 'source' ],
        where: {
          source: null
        }
      })
    );
  });
  router.delete('/orphans', async (req, res) => {
    logger.debug(`ChapterAPI --> delete orphans chapters`);
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
  router.get('/:id', async (req, res) => {
    logger.debug(`ChapterAPI --> get chapters ${req.params.id}`);
    const chapter = await db.findChapterById(req.params.id)
    res.send( {
      ...chapter,
      pages: chapter.pages
    } );
  });
  router.get('/:id/next', async (req, res) => {
    logger.debug(`ChapterAPI --> get next chapters ${req.params.id}`);
    res.send(
      await db.findNextChapterById(req.params.id)
    );
  });
  router.get('/:id/previous', async (req, res) => {
    logger.debug(`ChapterAPI --> get previous chapters ${req.params.id}`);
    res.send(
      await db.findPreviousChapterById(req.params.id)
    );
  });
  router.post('/', async (req, res) => {
    logger.debug(`ChapterAPI --> find chapters ${(req.body as any).link}`);
    res.send(
      await db.findChapterByLink((req.body as any).link)
    );
  });
  router.post('/scan', async (req, res) => {
    logger.debug(`ChapterAPI --> scan chapters ${req.body}`);
    scanChapterPages(req.body);
    res.send({
      status: 'running'
    });
  });

  return router;
}
